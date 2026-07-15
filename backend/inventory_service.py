import logging
import uuid
from datetime import datetime, timezone
from decimal import Decimal

from bson.decimal128 import Decimal128
from pymongo.errors import DuplicateKeyError, PyMongoError

from audit import append_audit_event
from inventory_domain import (
    InventoryConflict,
    apply_deltas,
    as_decimal,
    compute_deltas,
    operation_fingerprint,
    validate_subject_movement,
)
from restock import active_alert_key, shortage_triggers


logger = logging.getLogger(__name__)
BALANCE_FIELDS = ("on_hand", "reserved", "incoming", "planned_demand", "available", "projected")
RESTOCK_ROLES = {"warehouse", "manager_approver", "super_admin"}
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
    def __init__(self, *, db, client, capabilities, emailer=None):
        self.db = db
        self.client = client
        self.capabilities = capabilities
        self.emailer = emailer

    def _require_transactions(self):
        if not self.capabilities.transactions:
            raise InventoryError(
                503,
                "transaction_unavailable",
                "Operasi inventory aman tidak tersedia karena database belum mendukung transaksi.",
            )

    async def _subject(self, subject_type: str, subject_id: str, session=None) -> dict:
        collection = (
            self.db.materials if subject_type == "material" else self.db.product_variants
        )
        subject = await collection.find_one(
            {"id": subject_id}, {"_id": 0}, **_write_options(session)
        )
        if not subject:
            raise InventoryError(404, "inventory_subject_not_found", "Subjek inventory tidak ditemukan.")
        if subject.get("status", "active") != "active" or subject.get("active", True) is False:
            raise InventoryError(409, "inventory_subject_inactive", "Subjek inventory sudah diarsipkan.")
        if subject_type == "material" and subject.get("setup_status") != "ready":
            raise InventoryError(409, "material_setup_incomplete", "Setup bahan baku belum selesai.")
        if subject_type == "product_variant" and subject.get("production_type") != "ready_stock":
            raise InventoryError(409, "variant_not_ready_stock", "Varian bukan produk ready stock.")
        if not subject.get("inventory_tracking_enabled", False):
            raise InventoryError(409, "inventory_tracking_disabled", "Pelacakan inventory belum diaktifkan.")
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
        return await self._apply_operation(actor=actor, payload=dict(payload))

    async def _apply_operation(
        self,
        *,
        actor: dict,
        payload: dict,
        reservation_create: dict | None = None,
        reservation_transition: dict | None = None,
    ) -> dict:
        self._require_transactions()
        fingerprint = operation_fingerprint(payload)
        existing = await self._find_existing_operation(payload["operation_id"], fingerprint)
        if existing:
            return existing

        for attempt in range(3):
            email_recipients = []
            try:
                session = await self.client.start_session()
                async with session:
                    async with session.start_transaction():
                        concurrent = await self.db.stock_movements.find_one(
                            {"operation_id": payload["operation_id"]},
                            {"_id": 0},
                            **_write_options(session),
                        )
                        if concurrent:
                            return await self._result_for_existing(concurrent, fingerprint)
                        result, email_recipients = await self._apply_operation_in_transaction(
                            actor=actor,
                            payload=payload,
                            fingerprint=fingerprint,
                            session=session,
                            reservation_create=reservation_create,
                            reservation_transition=reservation_transition,
                        )
                await self._send_restock_emails(email_recipients)
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

        reservation = None
        if reservation_transition:
            reservation = await self.db.inventory_reservations.find_one(
                {"id": reservation_transition["reservation_id"]},
                {"_id": 0},
                **_write_options(session),
            )
            if not reservation:
                raise InventoryError(404, "reservation_not_found", "Reservation tidak ditemukan.")
            if reservation.get("status") != "active":
                raise InventoryError(409, "reservation_not_active", "Reservation sudah tidak aktif.")
            if reservation["subject_type"] != subject_type or reservation["subject_id"] != subject_id:
                raise InventoryError(409, "reservation_subject_conflict", "Subjek reservation tidak sesuai.")
            if _decimal(reservation["quantity"]) != _decimal(payload.get("quantity")):
                raise InventoryError(409, "reservation_quantity_conflict", "Jumlah reservation tidak sesuai.")
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
            raise InventoryError(400, "reservation_action_invalid", "Aksi reservation tidak valid.")
        reservation = await self.db.inventory_reservations.find_one(
            {"id": reservation_id}, {"_id": 0}
        )
        if not reservation:
            raise InventoryError(404, "reservation_not_found", "Reservation tidak ditemukan.")
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
                "status": final_status or ("released" if action == "release" else "consumed"),
            },
        )

    async def expire_due_reservations(
        self,
        *,
        actor: dict,
        at: datetime | None = None,
    ) -> dict:
        moment = (at or datetime.now(timezone.utc)).astimezone(timezone.utc).isoformat()
        reservations = await self.db.inventory_reservations.find(
            {"status": "active", "expires_at": {"$lte": moment}}, {"_id": 0}
        ).sort("expires_at", 1).to_list(500)
        expired = 0
        for reservation in reservations:
            operation_id = str(
                uuid.uuid5(EXPIRY_NAMESPACE, f"inventory-reservation-expiry:{reservation['id']}")
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
            {"subject_type": subject_type, "subject_id": subject_id, "status": "active"},
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
                "deduplication_key": active_alert_key(subject_type, subject_id, trigger_type),
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
        recipients = []
        for user in users:
            roles = set(user.get("roles") or ([user["role"]] if user.get("role") else []))
            if not roles.intersection(RESTOCK_ROLES):
                continue
            notification = {
                "id": str(uuid.uuid4()),
                "user_id": user["id"],
                "type": "restock_alert",
                "subject": f"Restock diperlukan: {alert['subject_name']}",
                "title": "Peringatan stok",
                "body_html": f"Trigger: {alert['trigger_type']}",
                "alert_id": alert["id"],
                "read": False,
                "created_at": now_iso(),
            }
            await self.db.notifications.insert_one(
                notification, **_write_options(session)
            )
            if user.get("email"):
                recipients.append(
                    {
                        "user_id": user["id"],
                        "email": user["email"],
                        "subject": notification["subject"],
                        "title": notification["title"],
                        "body_html": notification["body_html"],
                    }
                )
        return recipients

    async def _send_restock_emails(self, recipients: list[dict]):
        if not self.emailer:
            return
        for recipient in recipients:
            try:
                await self.emailer.send_email(
                    recipient["email"],
                    recipient["subject"],
                    recipient["title"],
                    recipient["body_html"],
                    db=None,
                    user_id=recipient["user_id"],
                )
            except Exception:
                logger.exception(
                    "Restock email failed after inventory commit (user_id=%s)",
                    recipient["user_id"],
                )

    async def list_balances(self, *, subject_type=None, limit=200) -> list[dict]:
        query = {"subject_type": subject_type} if subject_type else {}
        values = await self.db.inventory_balances.find(query, {"_id": 0}).sort(
            "updated_at", -1
        ).limit(min(limit, 500)).to_list(min(limit, 500))
        return serialize_inventory(values)

    async def get_balance(self, subject_type: str, subject_id: str) -> dict:
        value = await self._balance_document(subject_type, subject_id)
        if not value:
            raise InventoryError(404, "balance_not_found", "Saldo inventory tidak ditemukan.")
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
        values = await self.db.stock_movements.find(query, {"_id": 0}).sort(
            "created_at", -1
        ).limit(min(limit, 500)).to_list(min(limit, 500))
        return serialize_inventory(values)

    async def list_alerts(self, *, status=None, limit=200) -> list[dict]:
        query = {"status": status} if status else {}
        values = await self.db.restock_alerts.find(query, {"_id": 0}).sort(
            "updated_at", -1
        ).limit(min(limit, 500)).to_list(min(limit, 500))
        return serialize_inventory(values)

    async def resolve_alert(self, *, alert_id: str, actor: dict, reason: str) -> dict:
        self._require_transactions()
        session = await self.client.start_session()
        async with session:
            async with session.start_transaction():
                before = await self.db.restock_alerts.find_one(
                    {"id": alert_id}, {"_id": 0}, **_write_options(session)
                )
                if not before:
                    raise InventoryError(404, "restock_alert_not_found", "Alert restock tidak ditemukan.")
                if before.get("status") == "resolved":
                    return serialize_inventory(before)
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
        return serialize_inventory(after)
