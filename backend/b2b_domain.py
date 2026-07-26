INQUIRY_TRANSITIONS = {
    "new": {"reviewed", "rejected"},
    "reviewed": {"contacted", "rejected"},
    "contacted": {"converted", "rejected"},
    "converted": set(),
    "rejected": set(),
}

INQUIRY_ACTIONS = {
    "new": ["review", "reject"],
    "reviewed": ["contact", "reject"],
    "contacted": ["convert", "reject"],
    "converted": [],
    "rejected": [],
}


class B2BDomainError(Exception):
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


def inquiry_next_actions(status: str) -> list[str]:
    return list(INQUIRY_ACTIONS.get(status, []))


def validate_inquiry_transition(
    current_status: str,
    target_status: str,
    *,
    reason: str,
) -> None:
    if current_status not in INQUIRY_TRANSITIONS:
        raise B2BDomainError(
            409,
            "inquiry_status_unknown",
            "Status Inquiry saat ini tidak dikenali.",
        )
    if not INQUIRY_TRANSITIONS[current_status]:
        raise B2BDomainError(
            409,
            "inquiry_terminal",
            "Inquiry pada status terminal tidak dapat diubah.",
        )
    if target_status not in INQUIRY_TRANSITIONS[current_status]:
        raise B2BDomainError(
            409,
            "inquiry_transition_invalid",
            "Perpindahan status Inquiry tidak diizinkan.",
            details={
                "current_status": current_status,
                "permitted_next_actions": inquiry_next_actions(current_status),
            },
        )
    if target_status == "rejected" and not reason.strip():
        raise B2BDomainError(
            422,
            "reason_required",
            "Alasan penolakan wajib diisi.",
        )


def project_inquiry(document: dict) -> dict:
    value = {key: item for key, item in document.items() if key != "_id"}
    value["permitted_next_actions"] = inquiry_next_actions(value["status"])
    return value
