ROLE_POLICY_VERSION = "2026-07-22-v1"

ROLE_LABELS = {
    "super_admin": "Owner",
    "operations": "Operations",
    "commercial_finance": "Commercial & Finance",
    "retail_customer": "Retail Customer",
    "organization_customer": "Organization Customer",
}

CUSTOMER_ROLES = frozenset({"retail_customer", "organization_customer"})
INTERNAL_ROLES = frozenset({"super_admin", "operations", "commercial_finance"})
ASSIGNABLE_ROLES = tuple(sorted(CUSTOMER_ROLES | INTERNAL_ROLES))

# These role markers identify records that have not completed the identity review.
SUPERSEDED_INTERNAL_ROLE_MARKERS = frozenset(
    {
        "admin",
        "content_editor",
        "catalog_manager",
        "warehouse",
        "order_admin",
        "sales_estimator",
        "designer_engineer",
        "production",
        "quality_control",
        "finance",
        "manager_approver",
    }
)

ROLE_PERMISSIONS = {
    "super_admin": frozenset({"*"}),
    "operations": frozenset(
        {
            "admin.access",
            "catalog.read",
            "catalog.write",
            "content.read",
            "content.write",
            "media.read",
            "media.write",
            "materials.read",
            "materials.write",
            "materials.archive",
            "inventory.read",
            "inventory.write",
            "inventory.adjust",
            "restock_alerts.read",
            "restock_alerts.manage",
            "production.read",
            "production.write",
            "qc.read",
            "qc.write",
            "fulfilment.read",
            "fulfilment.write",
            "orders.read",
            "orders.write",
            "projects.read",
            "files.read",
        }
    ),
    "commercial_finance": frozenset(
        {
            "admin.access",
            "customers.read",
            "customers.write",
            "organizations.read",
            "organizations.write",
            "inquiries.read",
            "inquiries.write",
            "quotes.read",
            "quotes.write",
            "catalog.read",
            "catalog.write",
            "catalog.publish",
            "pricing.read",
            "pricing.write",
            "payments.read",
            "payments.write",
            "invoices.read",
            "invoices.write",
            "refunds.write",
            "orders.read",
            "projects.read",
            "notifications.write",
        }
    ),
    "retail_customer": frozenset(),
    "organization_customer": frozenset(),
}


def validate_roles(roles: object) -> tuple[str, ...]:
    """Return one valid canonical role, or no role for an invalid assignment."""
    if not isinstance(roles, list) or len(roles) != 1:
        return ()
    role = roles[0]
    if not isinstance(role, str) or role not in ROLE_PERMISSIONS:
        return ()
    return (role,)


def canonical_roles(user: dict) -> tuple[str, ...]:
    """Resolve only active, reviewed users to one canonical role."""
    if user.get("status", "active") != "active":
        return ()
    if user.get("access_state", "approved") == "access_review_required":
        return ()

    legacy_role = user.get("role")
    if legacy_role in SUPERSEDED_INTERNAL_ROLE_MARKERS:
        return ()
    if legacy_role:
        if legacy_role != "client":
            return ()
        if "roles" not in user:
            return ("retail_customer",)

    if "roles" not in user:
        return ()
    return validate_roles(user["roles"])


def permissions_for(user: dict) -> frozenset[str]:
    roles = canonical_roles(user)
    if not roles:
        return frozenset()
    return ROLE_PERMISSIONS[roles[0]]


def has_permission(user: dict, permission: str) -> bool:
    permissions = permissions_for(user)
    return "*" in permissions or permission in permissions


def is_internal(user: dict) -> bool:
    return any(role in INTERNAL_ROLES for role in canonical_roles(user))
