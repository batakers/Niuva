"""Validation and snapshot rules for CMS content blocks, per content type."""
import re
import uuid
from copy import deepcopy

CONTENT_TYPES = frozenset({"about", "capability", "faq", "cta", "contact"})

# Fields exposed to the public GET /content endpoint. Internal lifecycle fields
# (status, version, created_by, scheduled_at) are never exposed.
PUBLIC_BLOCK_FIELDS = frozenset({"id", "content_type", "slug", "fields", "updated_at"})


def normalize_slug(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", value.strip().lower())
    return normalized.strip("-")


def _error(code: str, field: str, message: str) -> dict:
    return {"code": code, "field": field, "message": message}


def _require_text(fields: dict, field: str, errors: list) -> None:
    if not str(fields.get(field, "")).strip():
        errors.append(_error("required", field, f"{field} wajib diisi."))


def _require_list(fields: dict, field: str, errors: list) -> None:
    value = fields.get(field)
    if not isinstance(value, list) or len(value) == 0:
        errors.append(_error("required", field, f"{field} wajib memiliki minimal satu item."))


def validate_content_fields(content_type: str, fields: dict) -> list[dict]:
    """Return a list of validation errors; empty list means the fields may be published."""
    fields = fields or {}
    errors: list[dict] = []

    if content_type == "about":
        _require_text(fields, "intro", errors)
        _require_list(fields, "dossierItems", errors)
        _require_list(fields, "approachSteps", errors)
        _require_list(fields, "values", errors)

    elif content_type == "capability":
        for field in ("title", "body", "output", "targetUsers", "cta"):
            _require_text(fields, field, errors)
        if fields.get("priority") not in ("primary", "supporting"):
            errors.append(_error("invalid_choice", "priority", "priority harus 'primary' atau 'supporting'."))

    elif content_type == "faq":
        _require_text(fields, "question", errors)
        _require_text(fields, "answer", errors)

    elif content_type == "cta":
        for field in ("label", "title", "body", "primaryActionLabel", "primaryActionTarget"):
            _require_text(fields, field, errors)

    elif content_type == "contact":
        for field in ("location", "email", "whatsapp", "whatsappHref"):
            _require_text(fields, field, errors)

    else:
        errors.append(_error("unknown_content_type", "content_type", "Jenis konten tidak dikenal."))

    return errors


def build_version_snapshot(block: dict, *, actor_id: str, reason: str, event: str) -> dict:
    """A point-in-time copy of a content block's fields for the version history log."""
    return {
        "id": str(uuid.uuid4()),
        "content_block_id": block["id"],
        "content_type": block["content_type"],
        "version": block["version"],
        "status": block["status"],
        "fields": deepcopy(block["fields"]),
        "event": event,
        "actor_id": actor_id,
        "reason": reason,
        "created_at": block["updated_at"],
    }


def project_block_for_public(block: dict) -> dict:
    return {key: deepcopy(value) for key, value in block.items() if key in PUBLIC_BLOCK_FIELDS}


# The publication lifecycle, matching the portfolio one: work is reviewed and
# previewed before it can reach the public.
CONTENT_STATUSES = ("draft", "review", "preview", "scheduled", "published", "archived")

CONTENT_TRANSITIONS = {
    "draft": {"review", "archived"},
    "review": {"draft", "preview", "archived"},
    "preview": {"review", "scheduled", "published", "archived"},
    "scheduled": {"published", "preview", "archived"},
    "published": {"draft", "archived"},
    "archived": {"draft"},
}

CONTENT_ACTIONS = {
    "draft": ["submit_review", "archive"],
    "review": ["return_to_draft", "approve_preview", "archive"],
    "preview": ["return_to_review", "publish", "archive"],
    "scheduled": ["publish", "return_to_preview", "archive"],
    "published": ["revise", "archive"],
    "archived": ["restore"],
}

# Reaching the public, or being scheduled to, is an approval rather than an
# edit. Authoring a block through the review stages is not.
CONTENT_PUBLISH_STATUSES = frozenset({"published", "scheduled"})


class ContentTransitionError(ValueError):
    def __init__(self, code: str, message: str, *, details: dict | None = None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.details = details or {}


def content_next_actions(status: str) -> list[str]:
    return list(CONTENT_ACTIONS.get(status, []))


def validate_content_transition(current_status: str, target_status: str) -> None:
    if current_status not in CONTENT_TRANSITIONS:
        raise ContentTransitionError(
            "content_status_unknown", "Status blok konten tidak dikenali."
        )
    if target_status not in CONTENT_TRANSITIONS[current_status]:
        raise ContentTransitionError(
            "content_transition_invalid",
            "Perpindahan status blok konten tidak diizinkan.",
            details={
                "current_status": current_status,
                "permitted_next_actions": content_next_actions(current_status),
            },
        )


def content_requires_publish_authority(target_status: str) -> bool:
    return target_status in CONTENT_PUBLISH_STATUSES
