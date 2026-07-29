"""Retail order domain: the canonical lifecycle, and how legacy maps onto it.

Retail is a separate aggregate from the B2B Inquiry to Quote to Project chain.
The orders collection predates that separation: it holds 3D-printing file
uploads driven by a four-status flow that is not the canonical retail
lifecycle. Those records are classified on read here, never rewritten.
"""

from datetime import datetime
from decimal import Decimal

# The canonical retail lifecycle, in order. A retail order walks this forward
# and never backward; there is no edit-in-place on a stage that has passed.
RETAIL_STATUSES = (
    "created",
    "awaiting_payment",
    "paid",
    "file_review",
    "queued",
    "in_production",
    "quality_control",
    "ready_to_ship",
    "ready_to_pickup",
    "shipped",
    "picked_up",
    "completed",
)

# Fulfilment splits once the goods are ready: shipping and pickup are parallel
# tails that rejoin at completed.
RETAIL_TRANSITIONS = {
    "created": {"awaiting_payment"},
    "awaiting_payment": {"paid"},
    "paid": {"file_review"},
    "file_review": {"queued"},
    "queued": {"in_production"},
    "in_production": {"quality_control"},
    "quality_control": {"ready_to_ship", "ready_to_pickup"},
    "ready_to_ship": {"shipped"},
    "ready_to_pickup": {"picked_up"},
    "shipped": {"completed"},
    "picked_up": {"completed"},
    "completed": set(),
}

RETAIL_ACTIONS = {
    "created": ["request_payment"],
    "awaiting_payment": ["mark_paid"],
    "paid": ["start_file_review"],
    "file_review": ["queue"],
    "queued": ["start_production"],
    "in_production": ["submit_quality_control"],
    "quality_control": ["mark_ready_to_ship", "mark_ready_to_pickup"],
    "ready_to_ship": ["mark_shipped"],
    "ready_to_pickup": ["mark_picked_up"],
    "shipped": ["complete"],
    "picked_up": ["complete"],
    "completed": [],
}

# Withheld until policy and a payment provider are approved. Named here rather
# than merely absent, so an attempt is refused with its reason instead of
# looking like an unknown transition.
SUSPENDED_ACTIONS = {
    "cancel": "retail_cancellation_suspended",
    "refund": "retail_refund_suspended",
    "return": "retail_return_suspended",
}

# What each legacy status corresponds to on the canonical lifecycle. This is a
# reading aid, not a migration: no legacy document is rewritten to these names.
LEGACY_STATUS_EQUIVALENT = {
    "pending_estimate": "created",
    "awaiting_payment": "awaiting_payment",
    "in_process": "in_production",
    "completed": "completed",
    "cancelled": None,
}


class RetailDomainError(Exception):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        *,
        details: dict | None = None,
    ):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details or {}

    def payload(self) -> dict:
        return {
            "code": self.code,
            "message": self.message,
            **({"details": self.details} if self.details else {}),
        }


def retail_next_actions(status: str) -> list[str]:
    return list(RETAIL_ACTIONS.get(status, []))


def validate_retail_transition(
    current_status: str,
    target_status: str,
    *,
    reason: str,
) -> None:
    if current_status not in RETAIL_TRANSITIONS:
        raise RetailDomainError(
            409,
            "retail_status_unknown",
            "Status pesanan retail tidak dikenali.",
        )
    if not RETAIL_TRANSITIONS[current_status]:
        raise RetailDomainError(
            409,
            "retail_terminal",
            "Pesanan retail pada status terminal tidak dapat diubah.",
        )
    if target_status not in RETAIL_TRANSITIONS[current_status]:
        raise RetailDomainError(
            409,
            "retail_transition_invalid",
            "Perpindahan status pesanan retail tidak diizinkan.",
            details={
                "current_status": current_status,
                "permitted_next_actions": retail_next_actions(current_status),
            },
        )
    if not reason.strip():
        raise RetailDomainError(
            422,
            "reason_required",
            "Alasan perubahan pesanan retail wajib diisi.",
        )


def classify_legacy_order(document: dict) -> dict:
    """Label a pre-separation order without touching what was stored.

    The legacy flow has no canonical equivalent for cancellation, so that maps
    to None rather than being forced onto a stage it never had. This helper
    preserves stored fields for offline classification only; HTTP routes must
    use one of the explicit projection functions below.
    """
    value = {key: item for key, item in document.items() if key != "_id"}
    status = value.get("status")
    value["record_class"] = "legacy_order"
    value["canonical_status_equivalent"] = (
        LEGACY_STATUS_EQUIVALENT.get(status) if isinstance(status, str) else None
    )
    value["creation_enabled"] = False
    value["mutations_enabled"] = False
    return value


def _legacy_projection_metadata(document: dict) -> dict[str, object]:
    status = document.get("status")
    return {
        "record_class": "legacy_order",
        "canonical_status_equivalent": (
            LEGACY_STATUS_EQUIVALENT.get(status) if isinstance(status, str) else None
        ),
        "creation_enabled": False,
        "mutations_enabled": False,
    }


def _safe_text(value: object) -> str | None:
    return value if isinstance(value, str) else None


def _safe_time(value: object) -> str | datetime | None:
    return value if isinstance(value, (str, datetime)) else None


def _safe_amount(value: object) -> int | float | Decimal | None:
    if isinstance(value, bool) or not isinstance(value, (int, float, Decimal)):
        return None
    return value


def _safe_file_metadata(value: object) -> dict[str, object]:
    if not isinstance(value, dict):
        return {}
    result: dict[str, object] = {}
    for key in ("original_filename", "content_type"):
        safe = _safe_text(value.get(key))
        if safe is not None:
            result[key] = safe
    size = value.get("size")
    if isinstance(size, int) and not isinstance(size, bool) and size >= 0:
        result["size"] = size
    return result


def _safe_estimate(value: object) -> dict[str, object]:
    if not isinstance(value, dict):
        return {}
    result: dict[str, object] = {}
    amount = _safe_amount(value.get("amount"))
    if amount is not None:
        result["amount"] = amount
    currency = _safe_text(value.get("currency"))
    if currency is not None:
        result["currency"] = currency
    estimated_at = _safe_time(value.get("estimated_at"))
    if estimated_at is not None:
        result["estimated_at"] = estimated_at
    return result


def _safe_payment(value: object) -> dict[str, object]:
    if not isinstance(value, dict):
        return {}
    result: dict[str, object] = {}
    verified = value.get("verified")
    if isinstance(verified, bool):
        result["verified"] = verified
    for key in ("uploaded_at", "verified_at"):
        safe = _safe_time(value.get(key))
        if safe is not None:
            result[key] = safe
    raw_proof = value.get("proof")
    if isinstance(raw_proof, dict) and isinstance(raw_proof.get("storage_path"), str):
        result["proof_recorded"] = True
    proof = _safe_file_metadata(raw_proof)
    if proof:
        result["proof"] = proof
    return result


def _safe_status_history(value: object, *, include_notes: bool) -> list[dict]:
    if not isinstance(value, list):
        return []
    result = []
    for event in value:
        if not isinstance(event, dict):
            continue
        status = _safe_text(event.get("status"))
        if status is None:
            continue
        projected: dict[str, object] = {"status": status}
        at = _safe_time(event.get("at"))
        if at is not None:
            projected["at"] = at
        if include_notes:
            note = _safe_text(event.get("note"))
            if note is not None:
                projected["note"] = note
        result.append(projected)
    return result


def project_customer_legacy_order(document: dict) -> dict:
    """Return the read-only legacy history a customer is allowed to see.

    Legacy records predate the current data boundary, so a projection must not
    inherit every stored field. In particular, free-text notes have no reliable
    customer-authored provenance and file storage locations are never returned.
    """
    fields = (
        "id",
        "order_number",
        "material_name",
        "status",
        "created_at",
        "updated_at",
    )
    value: dict[str, object] = {}
    for key in fields:
        safe = (
            _safe_time(document.get(key))
            if key.endswith("_at")
            else _safe_text(document.get(key))
        )
        if safe is not None:
            value[key] = safe
    value.update(_legacy_projection_metadata(document))

    file = _safe_file_metadata(document.get("file"))
    if file:
        value["file"] = file

    estimate = _safe_estimate(document.get("estimate"))
    if estimate:
        value["estimate"] = estimate

    payment = _safe_payment(document.get("payment"))
    if payment:
        value["payment"] = payment

    value["status_history"] = _safe_status_history(
        document.get("status_history"),
        include_notes=False,
    )

    return value


def project_internal_legacy_order(
    document: dict,
    *,
    include_payment: bool,
    include_operational_notes: bool,
) -> dict:
    """Return an allowlisted internal projection for an authorized order reader."""

    text_fields = (
        "id",
        "order_number",
        "user_id",
        "user_name",
        "user_email",
        "material_id",
        "material_name",
        "status",
    )
    value: dict[str, object] = {}
    for key in text_fields:
        safe_text = _safe_text(document.get(key))
        if safe_text is not None:
            value[key] = safe_text
    for key in ("created_at", "updated_at"):
        safe_time = _safe_time(document.get(key))
        if safe_time is not None:
            value[key] = safe_time
    if include_operational_notes:
        notes = _safe_text(document.get("notes"))
        if notes is not None:
            value["notes"] = notes
    value.update(_legacy_projection_metadata(document))

    file = _safe_file_metadata(document.get("file"))
    raw_file = document.get("file")
    if isinstance(raw_file, dict) and isinstance(raw_file.get("storage_path"), str):
        file["historical_file_recorded"] = True
    if file:
        value["file"] = file
    value["status_history"] = _safe_status_history(
        document.get("status_history"),
        include_notes=include_operational_notes,
    )

    if include_payment:
        estimate = _safe_estimate(document.get("estimate"))
        if estimate:
            value["estimate"] = estimate
        payment = _safe_payment(document.get("payment"))
        if payment:
            value["payment"] = payment

    return value


def project_retail_order(document: dict) -> dict:
    value = {key: item for key, item in document.items() if key != "_id"}
    value["record_class"] = "retail_order"
    value["permitted_next_actions"] = retail_next_actions(value["status"])
    value["suspended_actions"] = sorted(SUSPENDED_ACTIONS)
    return value
