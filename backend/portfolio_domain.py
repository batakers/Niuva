"""Portfolio publication: what the public may see, and how it gets there.

Two rules carry the weight here.

Nothing reaches the public until it is published. The public projection is an
allowlist, so a field added to the aggregate later stays internal until someone
publishes it deliberately.

A portfolio entry is never hard deleted. Deleting loses the record that the
work existed and who removed it; archiving keeps both and can be undone.
"""

from copy import deepcopy

PORTFOLIO_STATUSES = (
    "draft",
    "review",
    "preview",
    "scheduled",
    "published",
    "archived",
)

PORTFOLIO_TRANSITIONS = {
    "draft": {"review", "archived"},
    # Review can send work back rather than only forward.
    "review": {"draft", "preview", "archived"},
    "preview": {"review", "scheduled", "published", "archived"},
    "scheduled": {"published", "preview", "archived"},
    # A live snapshot stays public while a new working revision is prepared.
    "published": {"draft", "archived"},
    # Archived is a resting state, not a grave: work can come back as a draft.
    "archived": {"draft"},
}

PORTFOLIO_ACTIONS = {
    "draft": ["submit_review", "archive"],
    "review": ["return_to_draft", "approve_preview", "archive"],
    "preview": ["return_to_review", "schedule", "publish", "archive"],
    "scheduled": ["publish", "return_to_preview", "archive"],
    "published": ["revise", "archive"],
    "archived": ["restore"],
}

# Approval is a separate authority from authoring. Reaching the public, or
# being scheduled to, needs it; moving work along the draft stages does not.
PUBLISH_TRANSITIONS = frozenset({"published", "scheduled"})

# Everything the public may see. An allowlist, so a field added later stays
# internal until someone publishes it deliberately.
PUBLIC_PORTFOLIO_FIELDS = (
    "id",
    "title_id",
    "title_en",
    "category",
    "description_id",
    "description_en",
    "images",
    "featured",
    "display_order",
    "published_at",
)

# What a completed B2B project may contribute to a portfolio draft. Everything
# else stays behind: customer identity, files, internal notes, the quotation,
# payments, suppliers, cost, and margin.
PROJECT_PREFILL_FIELDS = ("category",)


class PortfolioDomainError(Exception):
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


def portfolio_next_actions(status: str) -> list[str]:
    return list(PORTFOLIO_ACTIONS.get(status, []))


def validate_portfolio_transition(
    current_status: str,
    target_status: str,
    *,
    reason: str,
) -> None:
    if current_status not in PORTFOLIO_TRANSITIONS:
        raise PortfolioDomainError(
            409, "portfolio_status_unknown", "Status portofolio tidak dikenali."
        )
    if target_status not in PORTFOLIO_TRANSITIONS[current_status]:
        raise PortfolioDomainError(
            409,
            "portfolio_transition_invalid",
            "Perpindahan status portofolio tidak diizinkan.",
            details={
                "current_status": current_status,
                "permitted_next_actions": portfolio_next_actions(current_status),
            },
        )
    if not reason.strip():
        raise PortfolioDomainError(
            422, "reason_required", "Alasan perubahan portofolio wajib diisi."
        )


def requires_publish_authority(target_status: str) -> bool:
    return target_status in PUBLISH_TRANSITIONS


def project_public_portfolio(document: dict) -> dict:
    """The published entry as the public may see it."""
    return {
        field: deepcopy(document[field])
        for field in PUBLIC_PORTFOLIO_FIELDS
        if field in document
    }


def project_admin_portfolio(document: dict) -> dict:
    value = {key: item for key, item in document.items() if key != "_id"}
    value["permitted_next_actions"] = portfolio_next_actions(value.get("status", ""))
    return value


def prefill_from_project(project: dict) -> dict:
    """Seed a portfolio draft from a completed project, carrying nothing private.

    A finished project is full of things a public page must never show: who the
    customer was, what they paid, what it cost, which supplier was used, and
    every internal note along the way. Rather than stripping those, this builds
    the draft from an allowlist, so a field added to the project later cannot
    arrive here by accident.
    """
    if project.get("status") != "completed":
        raise PortfolioDomainError(
            409,
            "project_not_completed",
            "Portofolio hanya dapat di-prefill dari Project yang selesai.",
            details={"current_status": project.get("status")},
        )

    snapshot = project.get("quote_snapshot") or {}
    scope = snapshot.get("scope_snapshot") or {}
    return {
        # The requirement describes the work; the brief and company do not.
        "title_id": str(scope.get("need", "")).strip(),
        "title_en": str(scope.get("need", "")).strip(),
        "description_id": "",
        "description_en": "",
        "images": [],
        "featured": False,
        **{
            field: project[field]
            for field in PROJECT_PREFILL_FIELDS
            if field in project
        },
        "source_project_id": project["id"],
    }


def reorder_entries(
    entries: list[dict],
    ordered_ids: list[str],
) -> list[dict]:
    """Assign display order from an explicit sequence.

    The caller sends the whole order, not a pair to swap, so two people
    reordering at once cannot interleave into an order neither of them chose.
    """
    known = {entry["id"] for entry in entries}
    if set(ordered_ids) != known:
        raise PortfolioDomainError(
            409,
            "portfolio_order_incomplete",
            "Urutan harus memuat seluruh entri portofolio tepat satu kali.",
            details={
                "missing": sorted(known - set(ordered_ids)),
                "unknown": sorted(set(ordered_ids) - known),
            },
        )
    if len(ordered_ids) != len(set(ordered_ids)):
        raise PortfolioDomainError(
            409,
            "portfolio_order_duplicated",
            "Satu entri tidak boleh muncul lebih dari sekali dalam urutan.",
        )
    return [
        {"id": entry_id, "display_order": index}
        for index, entry_id in enumerate(ordered_ids)
    ]
