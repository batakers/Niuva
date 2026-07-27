from copy import deepcopy
from decimal import Decimal
import uuid

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

QUOTE_ACTIONS = {
    "draft": ["create_revision", "submit_internal_review"],
    "internal_review": ["send", "return_to_draft"],
    "sent": ["accept", "request_revision", "expire", "reject"],
    "accepted": ["create_project"],
    "revision_requested": ["create_revision"],
    "expired": [],
    "rejected": [],
}

QUOTE_TRANSITIONS = {
    "draft": {"internal_review"},
    "internal_review": {"draft", "sent"},
    "sent": {"accepted", "revision_requested", "expired", "rejected"},
    "accepted": set(),
    "revision_requested": set(),
    "expired": set(),
    "rejected": set(),
}

PROJECT_ACTIONS = {
    "planned": ["activate", "cancel"],
    "active": ["hold", "complete", "cancel"],
    "on_hold": ["resume", "cancel"],
    "completed": [],
    "cancelled": [],
}

PROJECT_TRANSITIONS = {
    "planned": {"active", "cancelled"},
    "active": {"on_hold", "completed", "cancelled"},
    "on_hold": {"active", "cancelled"},
    "completed": set(),
    "cancelled": set(),
}


def build_quote_item_snapshot(
    item: dict,
    *,
    variant: dict | None = None,
    product: dict | None = None,
    materials_by_id: dict | None = None,
) -> dict:
    """Capture what a quoted line commits to, at the moment it is quoted.

    A quotation version is immutable, so the catalog is read here and copied
    in. Later renames, repricing, or BOM edits cannot rewrite what was quoted.
    The snapshots are derived from the catalog rather than accepted from the
    caller: a client-asserted snapshot could claim anything.
    """
    quantity = int(item["quantity"])
    unit_price_minor = int(item["unit_price_minor"])
    snapshot = {
        "quote_line_id": str(uuid.uuid4()),
        "description": str(item.get("description", "")).strip(),
        "quantity": quantity,
        # Derived, never taken from the caller: an immutable document must not
        # be able to disagree with its own arithmetic.
        "unit_price_minor": unit_price_minor,
        "line_total_minor": quantity * unit_price_minor,
        "variant_id": None,
        "product_snapshot": None,
        "configuration_snapshot": None,
        "material_snapshot": None,
    }

    if variant is None:
        return snapshot

    snapshot["variant_id"] = variant["id"]
    snapshot["product_snapshot"] = {
        "product_id": (product or {}).get("id"),
        "name": (product or {}).get("name", ""),
        "slug": (product or {}).get("slug", ""),
    }
    snapshot["configuration_snapshot"] = {
        "variant_id": variant["id"],
        "sku": variant.get("sku", ""),
        "name": variant.get("name", ""),
        "option_values": deepcopy(variant.get("option_values") or {}),
        "production_type": variant.get("production_type", ""),
    }

    lookup = materials_by_id or {}
    materials = []
    for entry in variant.get("bill_of_materials") or []:
        material = lookup.get(entry.get("material_id")) or {}
        per_unit = Decimal(str(entry.get("quantity_per_unit", "0")))
        materials.append(
            {
                "material_id": entry.get("material_id"),
                # Sourcing stays out: supplier_reference is permission gated
                # for staff and must never travel on a quotation line.
                "sku": material.get("sku", ""),
                "name": material.get("name", ""),
                "base_unit": material.get("base_unit"),
                "quantity_per_unit": str(per_unit),
                "quantity_required": str(per_unit * quantity),
            }
        )
    snapshot["material_snapshot"] = materials
    return snapshot


# --------------------------- Customer projections ---------------------------
#
# Everything a customer may see is named here. These are allowlists, never
# blacklists: a field added to an aggregate later is withheld until someone
# adds it deliberately. That is the safe direction to fail, and it is what
# keeps cost, margin, supplier, profit, internal notes, raw payment payloads,
# and internal audit data out of a customer response by construction rather
# than by remembering to exclude each one.

CUSTOMER_INQUIRY_FIELDS = (
    "id",
    "company",
    "pic_name",
    "pic_email",
    "pic_phone",
    "need",
    "timeline",
    "brief",
    "status",
    "created_at",
    "updated_at",
)

CUSTOMER_QUOTE_FIELDS = (
    "id",
    "status",
    "current_revision",
    "created_at",
    "updated_at",
)

CUSTOMER_QUOTE_VERSION_FIELDS = (
    "revision",
    "currency",
    "total_minor",
    "created_at",
)

CUSTOMER_SCOPE_FIELDS = (
    "company",
    "pic_name",
    "pic_email",
    "pic_phone",
    "need",
    "timeline",
    "brief",
)

CUSTOMER_QUOTE_ITEM_FIELDS = (
    "description",
    "quantity",
    "unit_price_minor",
    "line_total_minor",
)

CUSTOMER_PROJECT_FIELDS = (
    "id",
    "status",
    "created_at",
    "updated_at",
)

CUSTOMER_MILESTONE_FIELDS = (
    "title",
    "status",
    "due_date",
    "completed_at",
)


def _pick(document: dict, fields: tuple[str, ...]) -> dict:
    """Copy only the named fields, and only when the source carries them."""
    if not isinstance(document, dict):
        return {}
    return {field: document[field] for field in fields if field in document}


def project_customer_inquiry(document: dict) -> dict:
    """The submitter's own request, without triage state or audit history."""
    return _pick(document, CUSTOMER_INQUIRY_FIELDS)


def project_customer_quote(document: dict, current_version: dict | None = None) -> dict:
    """A quotation as the customer may see it, priced but never costed."""
    value = _pick(document, CUSTOMER_QUOTE_FIELDS)
    if current_version is not None:
        version = _pick(current_version, CUSTOMER_QUOTE_VERSION_FIELDS)
        version["scope_snapshot"] = _pick(
            current_version.get("scope_snapshot") or {},
            CUSTOMER_SCOPE_FIELDS,
        )
        version["items"] = [
            _pick(item, CUSTOMER_QUOTE_ITEM_FIELDS)
            for item in current_version.get("items") or []
        ]
        value["current_version"] = version
    return value


def project_customer_project(document: dict) -> dict:
    """Delivery progress only: no work orders, sourcing, or internal linkage."""
    value = _pick(document, CUSTOMER_PROJECT_FIELDS)
    value["milestones"] = [
        _pick(milestone, CUSTOMER_MILESTONE_FIELDS)
        for milestone in document.get("milestones") or []
    ]
    return value


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


def quote_next_actions(status: str) -> list[str]:
    return list(QUOTE_ACTIONS.get(status, []))


def validate_quote_transition(
    current_status: str,
    target_status: str,
    *,
    reason: str,
) -> None:
    if current_status not in QUOTE_TRANSITIONS:
        raise B2BDomainError(409, "quote_status_unknown", "Status Quote tidak dikenali.")
    if not QUOTE_TRANSITIONS[current_status]:
        raise B2BDomainError(
            409,
            "quote_terminal",
            "Quote pada status ini tidak dapat ditransisikan.",
        )
    if target_status not in QUOTE_TRANSITIONS[current_status]:
        raise B2BDomainError(
            409,
            "quote_transition_invalid",
            "Perpindahan status Quote tidak diizinkan.",
            details={
                "current_status": current_status,
                "permitted_next_actions": quote_next_actions(current_status),
            },
        )
    if not reason.strip():
        raise B2BDomainError(422, "reason_required", "Alasan perubahan Quote wajib diisi.")


def validate_quote_readiness(version: dict) -> None:
    """Fail closed before a commercial revision can leave the draft stage."""
    scope = version.get("scope_snapshot") or {}
    missing_scope = [
        field
        for field in ("company", "pic_name", "pic_email", "need")
        if not str(scope.get(field) or "").strip()
    ]
    items = version.get("items") or []
    invalid_items = [
        index
        for index, item in enumerate(items)
        if (
            not str(item.get("description") or "").strip()
            or not isinstance(item.get("quantity"), int)
            or item["quantity"] < 1
            or not isinstance(item.get("unit_price_minor"), int)
            or item["unit_price_minor"] < 0
        )
    ]
    total_minor = version.get("total_minor")
    if (
        missing_scope
        or not items
        or invalid_items
        or not isinstance(total_minor, int)
        or total_minor <= 0
    ):
        raise B2BDomainError(
            409,
            "quote_not_ready",
            "Quote belum memiliki scope dan harga yang siap ditinjau.",
            details={
                "missing_scope_fields": missing_scope,
                "items_required": not items,
                "invalid_item_indexes": invalid_items,
                "positive_total_required": (
                    not isinstance(total_minor, int) or total_minor <= 0
                ),
            },
        )


def project_quote(document: dict, current_version: dict | None = None) -> dict:
    value = {key: item for key, item in document.items() if key != "_id"}
    value["permitted_next_actions"] = quote_next_actions(value["status"])
    if value["status"] == "accepted" and value.get("project_id"):
        value["permitted_next_actions"] = []
    if current_version is not None:
        value["current_version"] = {
            key: item for key, item in current_version.items() if key != "_id"
        }
    return value


def project_next_actions(status: str) -> list[str]:
    return list(PROJECT_ACTIONS.get(status, []))


def validate_project_transition(
    current_status: str,
    target_status: str,
    *,
    reason: str,
) -> None:
    if current_status not in PROJECT_TRANSITIONS:
        raise B2BDomainError(
            409,
            "project_status_unknown",
            "Status Project tidak dikenali.",
        )
    if not PROJECT_TRANSITIONS[current_status]:
        raise B2BDomainError(
            409,
            "project_terminal",
            "Project pada status terminal tidak dapat diubah.",
        )
    if target_status not in PROJECT_TRANSITIONS[current_status]:
        raise B2BDomainError(
            409,
            "project_transition_invalid",
            "Perpindahan status Project tidak diizinkan.",
            details={
                "current_status": current_status,
                "permitted_next_actions": project_next_actions(current_status),
            },
        )
    if not reason.strip():
        raise B2BDomainError(422, "reason_required", "Alasan perubahan Project wajib diisi.")


def project_b2b_project(document: dict) -> dict:
    value = {key: item for key, item in document.items() if key != "_id"}
    value["permitted_next_actions"] = project_next_actions(value["status"])
    return value


WORK_ORDER_ACTIONS = {
    "planned": ["start", "cancel"],
    "in_progress": ["complete", "cancel"],
    "completed": [],
    "cancelled": [],
}

WORK_ORDER_TRANSITIONS = {
    "planned": {"in_progress", "cancelled"},
    "in_progress": {"completed", "cancelled"},
    "completed": set(),
    "cancelled": set(),
}

# A project that has stopped moving cannot take on new production.
PROJECT_STATUSES_ACCEPTING_WORK = frozenset({"planned", "active"})


def build_material_requirements(
    material_snapshot: list[dict] | None,
    quantity: int,
) -> list[dict]:
    """Scale a quoted line's per-unit materials to an actual production run.

    Per-unit figures come from the accepted quotation version, so production
    consumes what was sold rather than whatever the catalog says today. Only
    the run size is applied here, and it is applied explicitly.
    """
    requirements = []
    for entry in material_snapshot or []:
        per_unit = Decimal(str(entry.get("quantity_per_unit", "0")))
        requirements.append(
            {
                "material_id": entry.get("material_id"),
                "sku": entry.get("sku", ""),
                "name": entry.get("name", ""),
                "base_unit": entry.get("base_unit"),
                "quantity_per_unit": str(per_unit),
                "quantity_required": str(per_unit * quantity),
            }
        )
    return requirements


def work_order_next_actions(status: str) -> list[str]:
    return list(WORK_ORDER_ACTIONS.get(status, []))


def validate_work_order_transition(
    current_status: str,
    target_status: str,
    *,
    reason: str,
) -> None:
    if current_status not in WORK_ORDER_TRANSITIONS:
        raise B2BDomainError(
            409,
            "work_order_status_unknown",
            "Status Work Order tidak dikenali.",
        )
    if not WORK_ORDER_TRANSITIONS[current_status]:
        raise B2BDomainError(
            409,
            "work_order_terminal",
            "Work Order pada status terminal tidak dapat diubah.",
        )
    if target_status not in WORK_ORDER_TRANSITIONS[current_status]:
        raise B2BDomainError(
            409,
            "work_order_transition_invalid",
            "Perpindahan status Work Order tidak diizinkan.",
            details={
                "current_status": current_status,
                "permitted_next_actions": work_order_next_actions(current_status),
            },
        )
    if not reason.strip():
        raise B2BDomainError(
            422,
            "reason_required",
            "Alasan perubahan Work Order wajib diisi.",
        )


def project_work_order(document: dict) -> dict:
    value = {key: item for key, item in document.items() if key != "_id"}
    value["permitted_next_actions"] = work_order_next_actions(value["status"])
    return value
