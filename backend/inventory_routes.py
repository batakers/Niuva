import csv
import io
from datetime import datetime, timezone
from decimal import Decimal
from typing import Literal
from uuid import UUID

from csv_safety import safe_csv_row
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from inventory_service import InventoryError
from pydantic import BaseModel, Field, field_validator, model_validator

SubjectType = Literal["material", "product_variant"]
MovementType = Literal[
    "receive",
    "produce",
    "reserve",
    "release",
    "consume",
    "ship",
    "damage",
    "adjustment",
    "plan_incoming",
    "cancel_incoming",
    "plan_demand",
    "cancel_demand",
]


class MovementPayload(BaseModel):
    operation_id: UUID
    subject_type: SubjectType
    subject_id: str = Field(min_length=1, max_length=200)
    movement_type: MovementType
    quantity: Decimal | None = None
    on_hand_delta: Decimal | None = None
    reference_type: str = Field(min_length=1, max_length=100)
    reference_id: str = Field(default="", max_length=200)
    expected_balance_version: int | None = Field(default=None, ge=0)
    reason: str = Field(min_length=3, max_length=500)

    @model_validator(mode="after")
    def validate_quantity_contract(self):
        if self.movement_type == "adjustment":
            if self.on_hand_delta is None or self.on_hand_delta == 0:
                raise ValueError("adjustment requires a non-zero on_hand_delta")
        elif self.quantity is None or self.quantity <= 0:
            raise ValueError("quantity must be positive")
        return self


class ReservationPayload(BaseModel):
    operation_id: UUID
    subject_type: SubjectType
    subject_id: str = Field(min_length=1, max_length=200)
    quantity: Decimal = Field(gt=0)
    reference_type: str = Field(min_length=1, max_length=100)
    reference_id: str = Field(min_length=1, max_length=200)
    expires_at: datetime | None = None
    expected_balance_version: int | None = Field(default=None, ge=0)
    reason: str = Field(min_length=3, max_length=500)

    @field_validator("expires_at")
    @classmethod
    def require_expiry_timezone(cls, value):
        if value is not None and (value.tzinfo is None or value.utcoffset() is None):
            raise ValueError("expires_at must include a timezone")
        return value


class ReservationTransitionPayload(BaseModel):
    operation_id: UUID
    reason: str = Field(min_length=3, max_length=500)


class ReasonPayload(BaseModel):
    reason: str = Field(min_length=3, max_length=500)


class AdjustmentRequestPayload(BaseModel):
    request_operation_id: UUID
    subject_type: SubjectType
    subject_id: str = Field(min_length=1, max_length=200)
    on_hand_delta: Decimal
    reference_type: str = Field(min_length=1, max_length=100)
    reference_id: str = Field(default="", max_length=200)
    expected_balance_version: int | None = Field(default=None, ge=0)
    reason: str = Field(min_length=3, max_length=500)

    @field_validator("on_hand_delta")
    @classmethod
    def non_zero_delta(cls, value):
        if value == 0:
            raise ValueError("on_hand_delta must be non-zero")
        return value


class AdjustmentDecisionPayload(BaseModel):
    expected_version: int = Field(ge=1)
    operation_id: UUID
    reason: str = Field(min_length=3, max_length=500)


class AdjustmentRejectionPayload(BaseModel):
    expected_version: int = Field(ge=1)
    reason: str = Field(min_length=3, max_length=500)


def _csv_response(fieldnames: list, rows: list, filename: str) -> Response:
    """Serialize dict rows to a CSV download. Bounded data (<=500 rows), no disk write."""
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    for row in rows:
        writer.writerow(safe_csv_row(row, fieldnames))
    return Response(
        content=buffer.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def build_inventory_router(
    *,
    get_service,
    require_permission,
    has_permission,
) -> APIRouter:
    router = APIRouter(prefix="/admin/inventory", tags=["inventory"])

    async def invoke(awaitable):
        try:
            return await awaitable
        except InventoryError as exc:
            raise HTTPException(
                status_code=exc.status_code, detail=exc.payload()
            ) from exc

    @router.get("/balances")
    async def list_balances(
        subject_type: SubjectType | None = None,
        limit: int = Query(default=200, ge=1, le=500),
        _actor: dict = Depends(require_permission("inventory.read")),
    ):
        return await invoke(
            get_service().list_balances(subject_type=subject_type, limit=limit)
        )

    @router.get("/balances/{subject_type}/{subject_id}")
    async def get_balance(
        subject_type: SubjectType,
        subject_id: str,
        _actor: dict = Depends(require_permission("inventory.read")),
    ):
        return await invoke(get_service().get_balance(subject_type, subject_id))

    @router.get("/movements")
    async def list_movements(
        subject_type: SubjectType | None = None,
        subject_id: str | None = Query(default=None, max_length=200),
        reference_id: str | None = Query(default=None, max_length=200),
        limit: int = Query(default=200, ge=1, le=500),
        _actor: dict = Depends(require_permission("inventory.read")),
    ):
        return await invoke(
            get_service().list_movements(
                subject_type=subject_type,
                subject_id=subject_id,
                reference_id=reference_id,
                limit=limit,
            )
        )

    @router.get("/balances/export")
    async def export_balances(
        subject_type: SubjectType | None = None,
        _actor: dict = Depends(require_permission("inventory.read")),
    ):
        balances = await invoke(
            get_service().list_balances(subject_type=subject_type, limit=500)
        )
        fieldnames = [
            "subject_type",
            "subject_id",
            "subject_name",
            "sku",
            "on_hand",
            "reserved",
            "available",
            "incoming",
            "planned_demand",
            "projected",
            "version",
        ]
        stamp = datetime.now(timezone.utc).strftime("%Y%m%d")
        return _csv_response(
            fieldnames, balances, f"niuva-inventory-balances-{stamp}.csv"
        )

    @router.get("/movements/export")
    async def export_movements(
        subject_type: SubjectType | None = None,
        subject_id: str | None = Query(default=None, max_length=200),
        reference_id: str | None = Query(default=None, max_length=200),
        _actor: dict = Depends(require_permission("inventory.read")),
    ):
        movements = await invoke(
            get_service().list_movements(
                subject_type=subject_type,
                subject_id=subject_id,
                reference_id=reference_id,
                limit=500,
            )
        )
        fieldnames = [
            "created_at",
            "subject_type",
            "subject_id",
            "movement_type",
            "quantity",
            "balance_version_before",
            "balance_version_after",
            "reference_type",
            "reference_id",
            "reason",
            "created_by",
        ]
        stamp = datetime.now(timezone.utc).strftime("%Y%m%d")
        return _csv_response(
            fieldnames, movements, f"niuva-stock-movements-{stamp}.csv"
        )

    @router.post("/movements")
    async def apply_movement(
        payload: MovementPayload,
        actor: dict = Depends(require_permission("inventory.write")),
    ):
        if payload.movement_type in {"reserve", "release"}:
            raise HTTPException(
                status_code=409,
                detail={
                    "code": "reservation_endpoint_required",
                    "message": "Reserve dan release wajib melalui endpoint lifecycle reservation.",
                },
            )
        if payload.movement_type == "adjustment":
            raise HTTPException(
                status_code=409,
                detail={
                    "code": "adjustment_approval_required",
                    "message": "Adjustment wajib melalui request dan approval manager.",
                },
            )
        if payload.movement_type == "damage" and not has_permission(
            actor, "inventory.adjust"
        ):
            raise HTTPException(
                status_code=403,
                detail="Permission required: inventory.adjust",
            )
        return await invoke(
            get_service().apply_operation(
                actor=actor,
                payload=payload.model_dump(mode="json", exclude_none=True),
            )
        )

    @router.post("/adjustment-requests", status_code=status.HTTP_201_CREATED)
    async def create_adjustment_request(
        payload: AdjustmentRequestPayload,
        actor: dict = Depends(require_permission("inventory.write")),
    ):
        return await invoke(
            get_service().create_adjustment_request(
                actor=actor,
                payload=payload.model_dump(mode="json"),
            )
        )

    @router.get("/adjustment-requests")
    async def list_adjustment_requests(
        request_status: Literal["pending", "approved", "rejected"] | None = Query(
            default=None,
            alias="status",
        ),
        limit: int = Query(default=200, ge=1, le=500),
        _actor: dict = Depends(require_permission("inventory.adjust")),
    ):
        return await invoke(
            get_service().list_adjustment_requests(
                status=request_status,
                limit=limit,
            )
        )

    @router.post("/adjustment-requests/{request_id}/approve")
    async def approve_adjustment_request(
        request_id: str,
        payload: AdjustmentDecisionPayload,
        actor: dict = Depends(require_permission("inventory.adjust")),
    ):
        return await invoke(
            get_service().approve_adjustment_request(
                request_id,
                expected_version=payload.expected_version,
                operation_id=str(payload.operation_id),
                reason=payload.reason,
                actor=actor,
            )
        )

    @router.post("/adjustment-requests/{request_id}/reject")
    async def reject_adjustment_request(
        request_id: str,
        payload: AdjustmentRejectionPayload,
        actor: dict = Depends(require_permission("inventory.adjust")),
    ):
        return await invoke(
            get_service().reject_adjustment_request(
                request_id,
                expected_version=payload.expected_version,
                reason=payload.reason,
                actor=actor,
            )
        )

    @router.get("/reservations")
    async def list_reservations(
        subject_type: SubjectType | None = None,
        subject_id: str | None = Query(default=None, max_length=200),
        reservation_status: (
            Literal["active", "released", "consumed", "expired"] | None
        ) = Query(default=None, alias="status"),
        limit: int = Query(default=200, ge=1, le=500),
        _actor: dict = Depends(require_permission("inventory.read")),
    ):
        return await invoke(
            get_service().list_reservations(
                subject_type=subject_type,
                subject_id=subject_id,
                status=reservation_status,
                limit=limit,
            )
        )

    @router.post("/reservations", status_code=status.HTTP_201_CREATED)
    async def create_reservation(
        payload: ReservationPayload,
        actor: dict = Depends(require_permission("inventory.write")),
    ):
        return await invoke(
            get_service().create_reservation(
                actor=actor,
                payload=payload.model_dump(mode="json", exclude_none=True),
            )
        )

    async def transition_reservation(reservation_id, action, payload, actor):
        return await invoke(
            get_service().transition_reservation(
                actor=actor,
                reservation_id=reservation_id,
                action=action,
                operation_id=str(payload.operation_id),
                reason=payload.reason,
            )
        )

    @router.post("/reservations/{reservation_id}/release")
    async def release_reservation(
        reservation_id: str,
        payload: ReservationTransitionPayload,
        actor: dict = Depends(require_permission("inventory.write")),
    ):
        return await transition_reservation(reservation_id, "release", payload, actor)

    @router.post("/reservations/{reservation_id}/consume")
    async def consume_reservation(
        reservation_id: str,
        payload: ReservationTransitionPayload,
        actor: dict = Depends(require_permission("inventory.write")),
    ):
        return await transition_reservation(reservation_id, "consume", payload, actor)

    @router.get("/restock-alerts")
    async def list_restock_alerts(
        alert_status: Literal["active", "resolved"] | None = Query(
            default=None, alias="status"
        ),
        limit: int = Query(default=200, ge=1, le=500),
        _actor: dict = Depends(require_permission("restock_alerts.read")),
    ):
        return await invoke(get_service().list_alerts(status=alert_status, limit=limit))

    @router.post("/restock-alerts/{alert_id}/resolve")
    async def resolve_restock_alert(
        alert_id: str,
        payload: ReasonPayload,
        actor: dict = Depends(require_permission("restock_alerts.manage")),
    ):
        return await invoke(
            get_service().resolve_alert(
                alert_id=alert_id,
                actor=actor,
                reason=payload.reason,
            )
        )

    return router
