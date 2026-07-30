import uuid
from datetime import datetime, timezone
from decimal import Decimal

from audit import append_audit_event
from bson.decimal128 import Decimal128
from inventory_domain import (
    InventoryConflict,
    apply_deltas,
    as_decimal,
    compute_deltas,
    operation_fingerprint,
    validate_subject_movement,
)
from notification_service import NotificationService
from permissions import has_permission
from pymongo.errors import DuplicateKeyError, PyMongoError
from restock import active_alert_key, shortage_triggers

BALANCE_FIELDS = (
    "on_hand",
    "reserved",
    "incoming",
    "planned_demand",
    "available",
    "projected",
)
EXPIRY_NAMESPACE = uuid.UUID("2680c649-5e19-4e45-9d8c-b230bd80aca4")


class InventoryError(Exception):
    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message

    def payload(self) -> dict:
        return {"code": self.code, "message": self.message}


class _StaleBalance(Exception):
    pass


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _write_options(session=None) -> dict:
    return {"session": session} if session is not None else {}


def _decimal(value) -> Decimal:
    if isinstance(value, Decimal128):
        return value.to_decimal()
    return as_decimal(value)


def _decimal128(value) -> Decimal128:
    return Decimal128(_decimal(value))


def _decimal_string(value) -> str:
    decimal = _decimal(value)
    if decimal == 0:
        return "0"
    return format(decimal.normalize(), "f")


def serialize_inventory(value):
    if isinstance(value, (Decimal, Decimal128)):
        return _decimal_string(value)
    if isinstance(value, dict):
        return {
            key: serialize_inventory(item)
            for key, item in value.items()
            if key != "_id"
        }
    if isinstance(value, list):
        return [serialize_inventory(item) for item in value]
    return value


class InventoryService:
    def __init__(self, *, db, client, capabilities, guard):
        self.db = db
        self.client = client
        self.capabilities = capabilities
        self.guard = guard

    async def _subject(self, subject_type: str, subject_id: str, session=None) -> dict:
        collection = (
            self.db.materials
            if subject_type == "material"
            else self.db.product_variants
        )
        subject = await collection.find_one(
            {"id": subject_id}, {"_id": 0}, **_write_options(session)
        )
        if not subject:
            raise InventoryError(
                404, "inventory_subject_not_found", "Subjek inventory tidak ditemukan."
            )
        if (
            subject.get("status", "active") != "active"
            or subject.get("active", True) is False
        ):
            raise InventoryError(
                409, "inventory_subject_inactive", "Subjek inventory sudah diarsipkan."
            )
        if subject_type == "material" and subject.get("setup_status") != "ready":
            raise InventoryError(
                409, "material_setup_incomplete", "Setup bahan baku belum selesai."
            )
        if (
            subject_type == "product_variant"
            and subject.get("production_type") != "ready_stock"
        ):
            raise InventoryError(
                409, "variant_not_ready_stock", "Varian bukan produk ready stock."
            )
        if not subject.get("inventory_tracking_enabled", False):
            raise InventoryError(
                409,
                "inventory_tracking_disabled",
                "Pelacakan inventory belum diaktifkan.",
            )
        return subject

    async def _balance_document(self, subject_type: str, subject_id: str, session=None):
        return await self.db.inventory_balances.find_one(
            {"subject_type": subject_type, "subject_id": subject_id},
            {"_id": 0},
            **_write_options(session),
        )

    @staticmethod
    def _domain_balance(document: dict | None) -> dict:
        return {
            field: _decimal((document or {}).get(field, 0))
            for field in ("on_hand", "reserved", "incoming", "planned_demand")
        }

    async def _result_for_existing(self, movement: dict, fingerprint: str) -> dict:
        if movement.get("request_fingerprint") != fingerprint:
            raise InventoryError(
                409,
                "operation_id_conflict",
                "Operation ID sudah digunakan untuk permintaan yang berbeda.",
            )
        balance = await self._balance_document(
            movement["subject_type"], movement["subject_id"]
        )
        result = {
            "movement": serialize_inventory(movement),
            "balance": serialize_inventory(balance),
            "replayed": True,
        }
        reservation_id = movement.get("reservation_id")
        if reservation_id:
            reservation = await self.db.inventory_reservations.find_one(
                {"id": reservation_id}, {"_id": 0}
            )
            result["reservation"] = serialize_inventory(reservation)
        return result

    async def _find_existing_operation(self, operation_id: str, fingerprint: str):
        movement = await self.db.stock_movements.find_one(
            {"operation_id": operation_id}, {"_id": 0}
        )
        if movement:
            return await self._result_for_existing(movement, fingerprint)
        return None

    async def apply_operation(self, *, actor: dict, payload: dict) -> dict:
        if payload.get("movement_type") == "adjustment":
            raise InventoryError(
                409,
                "adjustment_approval_required",
                "Adjustment wajib melalui request dan approval manager.",
            )
        if payload.get("movement_type") in {"reserve", "release"}:
            raise InventoryError(
                409,
                "reservation_endpoint_required",
                "Reserve dan release wajib melalui lifecycle reservation.",
            )
        return await self._apply_operation(actor=actor, payload=dict(payload))

    async def create_adjustment_request(
        self,
        *,
        actor: dict,
        payload: dict,
    ) -> dict:
        delta = _decimal(payload.get("on_hand_delta"))
        if delta == 0:
            raise InventoryError(
                422,
                "adjustment_delta_invalid",
                "Adjustment memerlukan delta non-zero.",
            )
        await self._subject(payload["subject_type"], payload["subject_id"])
        request_operation_id = payload["request_operation_id"]
        existing = await self.db.inventory_adjustment_requests.find_one(
            {"request_operation_id": request_operation_id},
            {"_id": 0},
        )
        fingerprint_payload = {
            "operation_id": request_operation_id,
            "subject_type": payload["subject_type"],
            "subject_id": payload["subject_id"],
            "movement_type": "adjustment",
            "on_hand_delta": _decimal_string(delta),
            "reference_type": payload.get("reference_type", "manual"),
            "reference_id": payload.get("reference_id", ""),
            "expected_balance_version": payload.get("expected_balance_version"),
            "reason": payload["reason"].strip(),
        }
        fingerprint = operation_fingerprint(fingerprint_payload)
        if existing:
            if existing.get("request_fingerprint") != fingerprint:
                raise InventoryError(
                    409,
                    "operation_id_conflict",
                    "Request operation ID sudah digunakan untuk data berbeda.",
                )
            return serialize_inventory(existing)
        timestamp = now_iso()
        request = {
            "id": str(uuid.uuid4()),
            "request_operation_id": request_operation_id,
            "request_fingerprint": fingerprint,
            "subject_type": payload["subject_type"],
            "subject_id": payload["subject_id"],
            "on_hand_delta": _decimal128(delta),
            "reference_type": payload.get("reference_type", "manual"),
            "reference_id": payload.get("reference_id", ""),
            "expected_balance_version": payload.get("expected_balance_version"),
            "reason": payload["reason"].strip(),
            "status": "pending",
            "version": 1,
            "requested_by": actor.get("id"),
            "created_at": timestamp,
            "updated_at": timestamp,
        }

        async def mutation(session):
            await self.db.inventory_adjustment_requests.insert_one(
                request,
                **_write_options(session),
            )
            await append_audit_event(
                self.db,
                actor=actor,
                action="inventory.adjustment_requested",
                target_type="inventory_adjustment_request",
                target_id=request["id"],
                after=serialize_inventory(request),
                reason=request["reason"],
                session=session,
            )
            return serialize_inventory(request)

        return await self.guard.run(
            mutation,
            operation_name="inventory.create_adjustment_request",
        )

    async def list_adjustment_requests(
        self,
        *,
        status: str | None = None,
        limit: int = 200,
    ) -> list[dict]:
        query = {"status": status} if status else {}
        requests = (
            await self.db.inventory_adjustment_requests.find(
                query,
                {"_id": 0},
            )
            .sort("created_at", -1)
            .limit(min(limit, 500))
            .to_list(min(limit, 500))
        )
        return serialize_inventory(requests)

    async def approve_adjustment_request(
        self,
        request_id: str,
        *,
        expected_version: int,
        operation_id: str,
        reason: str,
        actor: dict,
    ) -> dict:
        request = await self.db.inventory_adjustment_requests.find_one(
            {"id": request_id},
            {"_id": 0},
        )
        if not request:
            raise InventoryError(
                404,
                "adjustment_request_not_found",
                "Request adjustment tidak ditemukan.",
            )
        if request.get("status") == "approved":
            if request.get("approval_operation_id") == operation_id:
                movement = await self.db.stock_movements.find_one(
                    {"operation_id": operation_id},
                    {"_id": 0},
                )
                return {
                    "request": serialize_inventory(request),
                    "movement": serialize_inventory(movement),
                    "replayed": True,
                }
            raise InventoryError(
                409,
                "adjustment_request_closed",
                "Request adjustment sudah diproses.",
            )
        if request.get("status") != "pending":
            raise InventoryError(
                409,
                "adjustment_request_closed",
                "Request adjustment sudah diproses.",
            )
        if request.get("version") != expected_version:
            raise InventoryError(
                409,
                "version_conflict",
                "Request adjustment telah berubah.",
            )
        if request.get("requested_by") == actor.get("id"):
            raise InventoryError(
                409,
                "self_approval_forbidden",
                "Pembuat request tidak boleh menyetujui adjustment sendiri.",
            )
        movement_payload = {
            "operation_id": operation_id,
            "subject_type": request["subject_type"],
            "subject_id": request["subject_id"],
            "movement_type": "adjustment",
            "on_hand_delta": _decimal_string(request["on_hand_delta"]),
            "reference_type": "inventory_adjustment_request",
            "reference_id": request_id,
            "expected_balance_version": request.get("expected_balance_version"),
            "reason": reason.strip(),
        }
        fingerprint = operation_fingerprint(movement_payload)
        timestamp = now_iso()

        async def mutation(session):
            result, recipients = await self._apply_operation_in_transaction(
                actor=actor,
                payload=movement_payload,
                fingerprint=fingerprint,
                session=session,
                reservation_create=None,
                reservation_transition=None,
            )
            updated = await self.db.inventory_adjustment_requests.update_one(
                {
                    "id": request_id,
                    "status": "pending",
                    "version": expected_version,
                },
                {
                    "$set": {
                        "status": "approved",
                        "version": expected_version + 1,
                        "approval_operation_id": operation_id,
                        "approved_by": actor.get("id"),
                        "approval_reason": reason.strip(),
                        "approved_at": timestamp,
                        "updated_at": timestamp,
                    }
                },
                **_write_options(session),
            )
            if not updated.matched_count:
                raise InventoryError(
                    409,
                    "version_conflict",
                    "Request adjustment berubah selama approval.",
                )
            approved = {
                **request,
                "status": "approved",
                "version": expected_version + 1,
                "approval_operation_id": operation_id,
                "approved_by": actor.get("id"),
                "approval_reason": reason.strip(),
                "approved_at": timestamp,
                "updated_at": timestamp,
            }
            await append_audit_event(
                self.db,
                actor=actor,
                action="inventory.adjustment_approved",
                target_type="inventory_adjustment_request",
                target_id=request_id,
                before=serialize_inventory(request),
                after=serialize_inventory(approved),
                reason=reason,
                session=session,
            )
            return {
                "request": serialize_inventory(approved),
                **result,
            }, recipients

        try:
            result, recipients = await self.guard.run(
                mutation,
                operation_name="inventory.approve_adjustment_request",
            )
        except _StaleBalance as exc:
            raise InventoryError(
                409,
                "balance_version_conflict",
                "Saldo berubah sebelum adjustment disetujui.",
            ) from exc
        return result

    async def reject_adjustment_request(
        self,
        request_id: str,
        *,
        expected_version: int,
        reason: str,
        actor: dict,
    ) -> dict:
        request = await self.db.inventory_adjustment_requests.find_one(
            {"id": request_id},
            {"_id": 0},
        )
        if not request:
            raise InventoryError(
                404,
                "adjustment_request_not_found",
                "Request adjustment tidak ditemukan.",
            )
        if request.get("requested_by") == actor.get("id"):
            raise InventoryError(
                409,
                "self_approval_forbidden",
                "Pembuat request tidak boleh mereview request sendiri.",
            )
        timestamp = now_iso()
        changes = {
            "status": "rejected",
            "version": expected_version + 1,
            "rejected_by": actor.get("id"),
            "rejection_reason": reason.strip(),
            "rejected_at": timestamp,
            "updated_at": timestamp,
        }

        async def mutation(session):
            updated = await self.db.inventory_adjustment_requests.update_one(
                {
                    "id": request_id,
                    "status": "pending",
                    "version": expected_version,
                },
                {"$set": changes},
                **_write_options(session),
            )
            if not updated.matched_count:
                raise InventoryError(
                    409,
                    "version_conflict",
                    "Request adjustment telah berubah.",
                )
            await append_audit_event(
                self.db,
                actor=actor,
                action="inventory.adjustment_rejected",
                target_type="inventory_adjustment_request",
                target_id=request_id,
                before=serialize_inventory(request),
                after=serialize_inventory({**request, **changes}),
                reason=reason,
                session=session,
            )
            return serialize_inventory({**request, **changes})

        return await self.guard.run(
            mutation,
            operation_name="inventory.reject_adjustment_request",
        )

    async def _apply_operation(
        self,
        *,
        actor: dict,
        payload: dict,
        reservation_create: dict | None = None,
        reservation_transition: dict | None = None,
    ) -> dict:
        fingerprint = operation_fingerprint(payload)
        existing = await self._find_existing_operation(
            payload["operation_id"], fingerprint
        )
        if existing:
            return existing

        async def mutation(session):
            concurrent = await self.db.stock_movements.find_one(
                {"operation_id": payload["operation_id"]},
                {"_id": 0},
                **_write_options(session),
            )
            if concurrent:
                # A concurrent writer already applied this operation, so there
                # is nothing to notify about.
                existing_result = await self._result_for_existing(
                    concurrent, fingerprint
                )
                return existing_result, []
            return await self._apply_operation_in_transaction(
                actor=actor,
                payload=payload,
                fingerprint=fingerprint,
                session=session,
                reservation_create=reservation_create,
                reservation_transition=reservation_transition,
            )

        for attempt in range(3):
            email_recipients = []
            try:
                result, email_recipients = await self.guard.run(
                    mutation, operation_name="inventory.apply_operation"
                )
                return result
            except _StaleBalance:
                if attempt == 2:
                    raise InventoryError(
                        409,
                        "balance_version_conflict",
                        "Saldo inventory berubah bersamaan; silakan ulangi operasi.",
                    )
            except InventoryConflict as exc:
                raise InventoryError(409, "inventory_conflict", str(exc)) from exc
            except DuplicateKeyError:
                existing = await self._find_existing_operation(
                    payload["operation_id"], fingerprint
                )
                if existing:
                    return existing
                if attempt == 2:
                    raise InventoryError(
                        409,
                        "balance_version_conflict",
                        "Saldo inventory berubah bersamaan; silakan ulangi operasi.",
                    )
            except PyMongoError as exc:
                if not exc.has_error_label("TransientTransactionError"):
                    raise
                if attempt == 2:
                    raise InventoryError(
                        409,
                        "balance_version_conflict",
                        "Transaksi inventory terus berbenturan; silakan ulangi operasi.",
                    ) from exc
                continue
        raise AssertionError("inventory retry loop exited unexpectedly")

    async def _apply_operation_in_transaction(
        self,
        *,
        actor: dict,
        payload: dict,
        fingerprint: str,
        session,
        reservation_create: dict | None,
        reservation_transition: dict | None,
    ):
        subject_type = payload["subject_type"]
        subject_id = payload["subject_id"]
        movement_type = payload["movement_type"]
        try:
            validate_subject_movement(subject_type, movement_type)
        except InventoryConflict:
            raise
        subject = await self._subject(subject_type, subject_id, session)
        balance_before = await self._balance_document(subject_type, subject_id, session)
        current_version = (balance_before or {}).get("version", 0)
        expected_version = payload.get("expected_balance_version")
        if expected_version is not None and expected_version != current_version:
            raise InventoryError(
                409,
                "expected_balance_version_conflict",
                "Versi saldo tidak sesuai dengan permintaan.",
            )

        if movement_type == "adjustment":
            deltas = compute_deltas(
                movement_type,
                on_hand_delta=payload.get("on_hand_delta"),
            )
        else:
            deltas = compute_deltas(movement_type, payload.get("quantity"))

        reservation: dict | None = None
        if reservation_transition:
            reservation = await self.db.inventory_reservations.find_one(
                {"id": reservation_transition["reservation_id"]},
                {"_id": 0},
                **_write_options(session),
            )
            if reservation is None:
                raise InventoryError(
                    404, "reservation_not_found", "Reservation tidak ditemukan."
                )
            if reservation.get("status") != "active":
                raise InventoryError(
                    409, "reservation_not_active", "Reservation sudah tidak aktif."
                )
            if (
                reservation["subject_type"] != subject_type
                or reservation["subject_id"] != subject_id
            ):
                raise InventoryError(
                    409,
                    "reservation_subject_conflict",
                    "Subjek reservation tidak sesuai.",
                )
            if _decimal(reservation["quantity"]) != _decimal(payload.get("quantity")):
                raise InventoryError(
                    409,
                    "reservation_quantity_conflict",
                    "Jumlah reservation tidak sesuai.",
                )
            if reservation_transition["action"] == "consume":
                deltas["reserved"] = -_decimal(payload["quantity"])

        balance_after = apply_deltas(self._domain_balance(balance_before), deltas)
        timestamp = now_iso()
        balance_id = (balance_before or {}).get("id") or str(uuid.uuid4())
        stored_balance = {
            "id": balance_id,
            "subject_type": subject_type,
            "subject_id": subject_id,
            **{field: _decimal128(balance_after[field]) for field in BALANCE_FIELDS},
            "version": current_version + 1,
            "updated_at": timestamp,
            "updated_by": actor.get("id"),
        }
        if balance_before:
            updated = await self.db.inventory_balances.update_one(
                {
                    "subject_type": subject_type,
                    "subject_id": subject_id,
                    "version": current_version,
                },
                {"$set": stored_balance},
                **_write_options(session),
            )
            if updated.matched_count == 0:
                raise _StaleBalance()
        else:
            await self.db.inventory_balances.insert_one(
                stored_balance, **_write_options(session)
            )

        movement = {
            "id": str(uuid.uuid4()),
            "operation_id": payload["operation_id"],
            "request_fingerprint": fingerprint,
            "subject_type": subject_type,
            "subject_id": subject_id,
            "movement_type": movement_type,
            "quantity": _decimal128(
                abs(_decimal(payload.get("on_hand_delta", 0)))
                if movement_type == "adjustment"
                else payload["quantity"]
            ),
            "deltas": {field: _decimal128(value) for field, value in deltas.items()},
            "reference_type": payload.get("reference_type", "manual"),
            "reference_id": payload.get("reference_id", ""),
            "reason": payload.get("reason", ""),
            "balance_version_before": current_version,
            "balance_version_after": current_version + 1,
            "created_at": timestamp,
            "created_by": actor.get("id"),
        }

        if reservation_create:
            reservation = {
                "id": reservation_create.get("id") or str(uuid.uuid4()),
                "subject_type": subject_type,
                "subject_id": subject_id,
                "quantity": _decimal128(payload["quantity"]),
                "reference_type": payload["reference_type"],
                "reference_id": payload["reference_id"],
                "status": "active",
                "expires_at": reservation_create.get("expires_at"),
                "created_at": timestamp,
                "created_by": actor.get("id"),
                "updated_at": timestamp,
                "updated_by": actor.get("id"),
            }
            await self.db.inventory_reservations.insert_one(
                reservation, **_write_options(session)
            )
            movement["reservation_id"] = reservation["id"]
        elif reservation_transition:
            assert reservation is not None
            transition_status = reservation_transition["status"]
            await self.db.inventory_reservations.update_one(
                {"id": reservation["id"], "status": "active"},
                {
                    "$set": {
                        "status": transition_status,
                        "transition_operation_id": payload["operation_id"],
                        "transition_reason": payload.get("reason", ""),
                        "updated_at": timestamp,
                        "updated_by": actor.get("id"),
                    }
                },
                **_write_options(session),
            )
            reservation = {
                **reservation,
                "status": transition_status,
                "transition_operation_id": payload["operation_id"],
                "transition_reason": payload.get("reason", ""),
                "updated_at": timestamp,
                "updated_by": actor.get("id"),
            }
            movement["reservation_id"] = reservation["id"]

        await self.db.stock_movements.insert_one(movement, **_write_options(session))
        await append_audit_event(
            self.db,
            actor=actor,
            action="inventory.movement_applied",
            target_type="stock_movement",
            target_id=movement["id"],
            before=serialize_inventory(balance_before),
            after=serialize_inventory(stored_balance),
            reason=payload.get("reason"),
            session=session,
        )
        email_recipients = await self._evaluate_restock(
            actor=actor,
            subject=subject,
            balance=stored_balance,
            session=session,
        )
        result = {
            "movement": serialize_inventory(movement),
            "balance": serialize_inventory(stored_balance),
            "replayed": False,
        }
        if reservation:
            result["reservation"] = serialize_inventory(reservation)
        return result, email_recipients

    async def apply_bulk_operations(
        self,
        *,
        actor: dict,
        operations: list[dict],
        extra_mutation=None,
    ) -> list[dict]:
        """Apply several movements, and one aggregate change, in one transaction.

        A production run touches every material on its bill at once. Reserving
        them one call at a time would leave a run half allocated the moment any
        material came up short, so the whole set commits or none of it does.
        ``extra_mutation`` runs inside the same transaction, which is how the
        owning aggregate is updated without a second, unprotected write.
        """
        if not operations:
            raise InventoryError(
                422, "inventory_operations_empty", "Tidak ada operasi inventory."
            )

        prepared = [
            {**operation, "fingerprint": operation_fingerprint(operation["payload"])}
            for operation in operations
        ]

        replayed = [
            await self._find_existing_operation(
                operation["payload"]["operation_id"], operation["fingerprint"]
            )
            for operation in prepared
        ]
        if all(replayed):
            return replayed

        async def mutation(session):
            results = []
            for prepared_operation in prepared:
                result, _recipients = await self._apply_operation_in_transaction(
                    actor=actor,
                    payload=prepared_operation["payload"],
                    fingerprint=prepared_operation["fingerprint"],
                    session=session,
                    reservation_create=prepared_operation.get("reservation_create"),
                    reservation_transition=prepared_operation.get(
                        "reservation_transition"
                    ),
                )
                results.append(result)
            if extra_mutation is not None:
                await extra_mutation(session, results)
            return results

        for attempt in range(3):
            try:
                return await self.guard.run(
                    mutation,
                    operation_name="inventory.apply_bulk_operations",
                    retry_safe=True,
                )
            except _StaleBalance:
                if attempt == 2:
                    raise InventoryError(
                        409,
                        "balance_version_conflict",
                        "Saldo inventory berubah bersamaan; silakan ulangi operasi.",
                    )
            except InventoryConflict as exc:
                # A shortage lands here. The transaction is already aborted, so
                # no material was reserved and no movement was recorded.
                raise InventoryError(409, "inventory_conflict", str(exc)) from exc
            except DuplicateKeyError:
                if attempt == 2:
                    raise InventoryError(
                        409,
                        "balance_version_conflict",
                        "Saldo inventory berubah bersamaan; silakan ulangi operasi.",
                    )
            except PyMongoError as exc:
                if exc.has_error_label("TransientTransactionError"):
                    raise InventoryError(
                        409,
                        "balance_version_conflict",
                        "Transaksi inventory terus berbenturan; silakan ulangi operasi.",
                    ) from exc
                raise
        raise AssertionError("inventory bulk retry loop exited unexpectedly")

    async def create_reservation(self, *, actor: dict, payload: dict) -> dict:
        operation_payload = {
            **payload,
            "movement_type": "reserve",
        }
        return await self._apply_operation(
            actor=actor,
            payload=operation_payload,
            reservation_create={"expires_at": payload.get("expires_at")},
        )

    async def transition_reservation(
        self,
        *,
        actor: dict,
        reservation_id: str,
        action: str,
        operation_id: str,
        reason: str,
        final_status: str | None = None,
    ) -> dict:
        if action not in {"release", "consume"}:
            raise InventoryError(
                400, "reservation_action_invalid", "Aksi reservation tidak valid."
            )
        reservation = await self.db.inventory_reservations.find_one(
            {"id": reservation_id}, {"_id": 0}
        )
        if not reservation:
            raise InventoryError(
                404, "reservation_not_found", "Reservation tidak ditemukan."
            )
        movement_type = action
        if action == "consume" and reservation["subject_type"] == "product_variant":
            movement_type = "ship"
        payload = {
            "operation_id": operation_id,
            "subject_type": reservation["subject_type"],
            "subject_id": reservation["subject_id"],
            "movement_type": movement_type,
            "quantity": _decimal_string(reservation["quantity"]),
            "reference_type": "reservation",
            "reference_id": reservation_id,
            "reservation_id": reservation_id,
            "reservation_action": action,
            "reason": reason,
        }
        return await self._apply_operation(
            actor=actor,
            payload=payload,
            reservation_transition={
                "reservation_id": reservation_id,
                "action": action,
                "status": final_status
                or ("released" if action == "release" else "consumed"),
            },
        )

    async def expire_due_reservations(
        self,
        *,
        actor: dict,
        at: datetime | None = None,
    ) -> dict:
        moment = (at or datetime.now(timezone.utc)).astimezone(timezone.utc).isoformat()
        reservations = (
            await self.db.inventory_reservations.find(
                {"status": "active", "expires_at": {"$lte": moment}}, {"_id": 0}
            )
            .sort("expires_at", 1)
            .to_list(500)
        )
        expired = 0
        for reservation in reservations:
            operation_id = str(
                uuid.uuid5(
                    EXPIRY_NAMESPACE,
                    f"inventory-reservation-expiry:{reservation['id']}",
                )
            )
            try:
                result = await self.transition_reservation(
                    actor=actor,
                    reservation_id=reservation["id"],
                    action="release",
                    operation_id=operation_id,
                    reason="Reservation expired automatically",
                    final_status="expired",
                )
                if not result.get("replayed"):
                    expired += 1
            except InventoryError as exc:
                if exc.code != "reservation_not_active":
                    raise
        return {"expired": expired}

    async def _evaluate_restock(self, *, actor, subject, balance, session):
        subject_type = balance["subject_type"]
        subject_id = balance["subject_id"]
        current_triggers = shortage_triggers(balance, subject.get("reorder_point", 0))
        existing = await self.db.restock_alerts.find(
            {
                "subject_type": subject_type,
                "subject_id": subject_id,
                "status": "active",
            },
            {"_id": 0},
            **_write_options(session),
        ).to_list(100)
        existing_by_trigger = {item["trigger_type"]: item for item in existing}
        timestamp = now_iso()
        email_recipients = []
        for trigger_type in current_triggers:
            current = existing_by_trigger.get(trigger_type)
            values = {
                "last_balance": serialize_inventory(balance),
                "updated_at": timestamp,
                "updated_by": actor.get("id"),
            }
            if current:
                await self.db.restock_alerts.update_one(
                    {"id": current["id"], "status": "active"},
                    {"$set": values},
                    **_write_options(session),
                )
                continue
            alert = {
                "id": str(uuid.uuid4()),
                "subject_type": subject_type,
                "subject_id": subject_id,
                "subject_name": subject.get("name") or subject.get("sku") or subject_id,
                "trigger_type": trigger_type,
                "deduplication_key": active_alert_key(
                    subject_type, subject_id, trigger_type
                ),
                "status": "active",
                "last_balance": serialize_inventory(balance),
                "created_at": timestamp,
                "created_by": actor.get("id"),
                **values,
            }
            await self.db.restock_alerts.insert_one(alert, **_write_options(session))
            await append_audit_event(
                self.db,
                actor=actor,
                action="inventory.restock_alert_created",
                target_type="restock_alert",
                target_id=alert["id"],
                after=alert,
                session=session,
            )
            recipients = await self._create_restock_notifications(
                alert=alert, session=session
            )
            email_recipients.extend(recipients)

        for alert in existing:
            if alert["trigger_type"] not in current_triggers:
                resolved = {
                    "status": "resolved",
                    "resolved_at": timestamp,
                    "resolved_by": actor.get("id"),
                    "resolution_reason": "Stock condition recovered automatically",
                    "updated_at": timestamp,
                }
                await self.db.restock_alerts.update_one(
                    {"id": alert["id"], "status": "active"},
                    {"$set": resolved},
                    **_write_options(session),
                )
                await append_audit_event(
                    self.db,
                    actor=actor,
                    action="inventory.restock_alert_auto_resolved",
                    target_type="restock_alert",
                    target_id=alert["id"],
                    before=alert,
                    after={**alert, **resolved},
                    session=session,
                )
        return email_recipients

    async def _create_restock_notifications(self, *, alert: dict, session):
        users = await self.db.users.find(
            {"status": "active"}, {"_id": 0}, **_write_options(session)
        ).to_list(1000)
        recipients: list[dict] = []
        notification_service = NotificationService(db=self.db)
        for user in users:
            if not has_permission(user, "restock_alerts.read"):
                continue
            subject = f"Restock diperlukan: {alert['subject_name']}"
            body = f"Trigger: {alert['trigger_type']}"
            # Published through the notification service so the bell holds one
            # shape, with a deduplication key and an allowlisted reference: a
            # recurring shortage is one row that resurfaces, not a new row per
            # observation.
            notification = await notification_service.publish(
                user_id=user["id"],
                event=f"inventory.restock_{alert['trigger_type']}",
                title=subject,
                body=body,
                reference_type="restock_alert",
                reference_id=alert["id"],
                session=session,
            )
            if user.get("email"):
                await notification_service.enqueue_delivery(
                    notification_id=notification["id"],
                    channel="email",
                    recipient=user["email"],
                    payload={
                        "subject": subject,
                        "title": "Peringatan stok",
                        "body_html": body,
                    },
                    session=session,
                )
        return recipients

    async def list_balances(self, *, subject_type=None, limit=200) -> list[dict]:
        query = {"subject_type": subject_type} if subject_type else {}
        values = (
            await self.db.inventory_balances.find(query, {"_id": 0})
            .sort("updated_at", -1)
            .limit(min(limit, 500))
            .to_list(min(limit, 500))
        )
        await self._enrich_balances(values)
        return serialize_inventory(values)

    async def _enrich_balances(self, values: list[dict]) -> None:
        """Give each balance its subject identity, derived figures, and status.

        A stored balance is deliberately lean: on_hand, reserved, incoming,
        planned_demand, and a version. Reading it, an operator needs the name
        behind the subject id, the available figure, and a verdict. The status
        is computed here, server-side, so the table, the CSV export, and any
        later consumer state the same verdict for the same numbers.
        """
        subjects: dict[str, dict[str, dict]] = {}
        for collection_name, type_name in (
            ("materials", "material"),
            ("product_variants", "product_variant"),
        ):
            wanted = sorted(
                {
                    value["subject_id"]
                    for value in values
                    if value["subject_type"] == type_name
                }
            )
            if not wanted:
                subjects[type_name] = {}
                continue
            documents = (
                await getattr(self.db, collection_name)
                .find({"id": {"$in": wanted}}, {"_id": 0})
                .to_list(len(wanted))
            )
            subjects[type_name] = {item["id"]: item for item in documents}

        for value in values:
            subject = subjects[value["subject_type"]].get(value["subject_id"]) or {}
            available = _decimal(value.get("on_hand", 0)) - _decimal(
                value.get("reserved", 0)
            )
            projected = (
                available
                + _decimal(value.get("incoming", 0))
                - _decimal(value.get("planned_demand", 0))
            )
            reorder_point = _decimal(subject.get("reorder_point", 0) or 0)
            if available <= 0:
                stock_status = "habis"
            elif reorder_point > 0 and available <= reorder_point:
                stock_status = "rendah"
            else:
                stock_status = "normal"
            value.update(
                {
                    "subject_name": subject.get("name", ""),
                    "sku": subject.get("sku", ""),
                    "available": available,
                    "projected": projected,
                    "reorder_point": reorder_point,
                    "stock_status": stock_status,
                }
            )

    async def get_balance(self, subject_type: str, subject_id: str) -> dict:
        value = await self._balance_document(subject_type, subject_id)
        if not value:
            raise InventoryError(
                404, "balance_not_found", "Saldo inventory tidak ditemukan."
            )
        return serialize_inventory(value)

    async def list_movements(
        self, *, subject_type=None, subject_id=None, reference_id=None, limit=200
    ) -> list[dict]:
        query = {
            key: value
            for key, value in {
                "subject_type": subject_type,
                "subject_id": subject_id,
                "reference_id": reference_id,
            }.items()
            if value is not None
        }
        values = (
            await self.db.stock_movements.find(query, {"_id": 0})
            .sort("created_at", -1)
            .limit(min(limit, 500))
            .to_list(min(limit, 500))
        )
        return serialize_inventory(values)

    async def list_reservations(
        self, *, subject_type=None, subject_id=None, status=None, limit=200
    ) -> list[dict]:
        query = {
            key: value
            for key, value in {
                "subject_type": subject_type,
                "subject_id": subject_id,
                "status": status,
            }.items()
            if value is not None
        }
        bounded_limit = min(limit, 500)
        values = (
            await self.db.inventory_reservations.find(query, {"_id": 0})
            .sort("updated_at", -1)
            .limit(bounded_limit)
            .to_list(bounded_limit)
        )
        return serialize_inventory(values)

    async def list_alerts(self, *, status=None, limit=200) -> list[dict]:
        query = {"status": status} if status else {}
        values = (
            await self.db.restock_alerts.find(query, {"_id": 0})
            .sort("updated_at", -1)
            .limit(min(limit, 500))
            .to_list(min(limit, 500))
        )
        return serialize_inventory(values)

    async def resolve_alert(self, *, alert_id: str, actor: dict, reason: str) -> dict:
        async def mutation(session):
            before = await self.db.restock_alerts.find_one(
                {"id": alert_id}, {"_id": 0}, **_write_options(session)
            )
            if not before:
                raise InventoryError(
                    404, "restock_alert_not_found", "Alert restock tidak ditemukan."
                )
            if before.get("status") == "resolved":
                return before
            changes = {
                "status": "resolved",
                "resolved_at": now_iso(),
                "resolved_by": actor.get("id"),
                "resolution_reason": reason,
                "updated_at": now_iso(),
            }
            await self.db.restock_alerts.update_one(
                {"id": alert_id, "status": "active"},
                {"$set": changes},
                **_write_options(session),
            )
            after = {**before, **changes}
            await append_audit_event(
                self.db,
                actor=actor,
                action="inventory.restock_alert_resolved",
                target_type="restock_alert",
                target_id=alert_id,
                before=before,
                after=after,
                reason=reason,
                session=session,
            )
            return after

        resolved = await self.guard.run(
            mutation, operation_name="inventory.resolve_alert"
        )
        return serialize_inventory(resolved)
