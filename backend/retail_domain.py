"""Retail order domain: the canonical lifecycle, and how legacy maps onto it.

Retail is a separate aggregate from the B2B Inquiry to Quote to Project chain.
The orders collection predates that separation: it holds 3D-printing file
uploads driven by a four-status flow that is not the canonical retail
lifecycle. Those records are classified on read here, never rewritten.
"""

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
    to None rather than being forced onto a stage it never had.
    """
    value = {key: item for key, item in document.items() if key != "_id"}
    status = value.get("status")
    value["record_class"] = "legacy_order"
    value["canonical_status_equivalent"] = LEGACY_STATUS_EQUIVALENT.get(status)
    value["creation_enabled"] = False
    value["mutations_enabled"] = False
    return value


def project_retail_order(document: dict) -> dict:
    value = {key: item for key, item in document.items() if key != "_id"}
    value["record_class"] = "retail_order"
    value["permitted_next_actions"] = retail_next_actions(value["status"])
    value["suspended_actions"] = sorted(SUSPENDED_ACTIONS)
    return value
