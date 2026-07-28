ROLE_POLICY_VERSION = "2026-07-26-v2"

ROLE_LABELS = {
    "content_editor": "Editor Konten",
    "catalog_manager": "Manajer Katalog",
    "warehouse": "Gudang",
    "order_admin": "Admin Pesanan",
    "sales_estimator": "Estimator Penjualan",
    "designer_engineer": "Desainer / Engineer",
    "production": "Produksi",
    "quality_control": "Quality Control",
    "finance": "Keuangan",
    "manager_approver": "Manager / Approver",
    "super_admin": "Super Admin",
    "retail_customer": "Pelanggan Retail",
    "organization_customer": "Pelanggan Organisasi",
}

CUSTOMER_ROLES = frozenset({"retail_customer", "organization_customer"})
INTERNAL_ROLE_ORDER = (
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
    "super_admin",
)
INTERNAL_ROLES = frozenset(INTERNAL_ROLE_ORDER)
ASSIGNABLE_ROLES = INTERNAL_ROLE_ORDER + tuple(sorted(CUSTOMER_ROLES))
_ROLE_ORDER = {role: index for index, role in enumerate(ASSIGNABLE_ROLES)}

# Aggregate and historical internal markers require an explicit reviewed mapping.
SUPERSEDED_INTERNAL_ROLE_MARKERS = frozenset(
    {
        "admin",
        "operations",
        "commercial_finance",
        *INTERNAL_ROLES,
    }
)

_ADMIN_BASE = frozenset({"admin.access", "dashboard.read"})

ROLE_PERMISSIONS = {
    "super_admin": frozenset({"*"}),
    "content_editor": _ADMIN_BASE
    | frozenset(
        {
            "content.read",
            "content.write",
            "content.archive",
            "media.read",
            "media.write",
            "portfolio.read",
            "portfolio.write",
        }
    ),
    "catalog_manager": _ADMIN_BASE
    | frozenset(
        {
            "catalog.read",
            "catalog.write",
            "pricing.read",
            "pricing.write",
            "media.read",
            "media.write",
            "supplier_reference.read",
            "supplier_reference.write",
        }
    ),
    "warehouse": _ADMIN_BASE
    | frozenset(
        {
            "materials.read",
            "materials.write",
            "materials.archive",
            "inventory.read",
            "inventory.write",
            "restock_alerts.read",
            "restock_alerts.manage",
            "production.read",
            "files.read",
        }
    ),
    "order_admin": _ADMIN_BASE
    | frozenset(
        {
            "customers.read",
            "customers.manage",
            "orders.read",
            "orders.write",
            "fulfilment.read",
            "fulfilment.write",
            "notifications.write",
            "files.read",
        }
    ),
    "sales_estimator": _ADMIN_BASE
    | frozenset(
        {
            "customers.read",
            "inquiries.read",
            "inquiries.write",
            "quotes.read",
            "quotes.write",
            "projects.read",
            "catalog.read",
            "pricing.read",
            "pricing.write",
            "supplier_reference.read",
            "files.read",
        }
    ),
    "designer_engineer": _ADMIN_BASE
    | frozenset(
        {
            "projects.read",
            "projects.write",
            "design.read",
            "design.write",
            "production.read",
            "files.read",
            "files.write",
        }
    ),
    "production": _ADMIN_BASE
    | frozenset(
        {
            "projects.read",
            "production.read",
            "production.write",
            "materials.read",
            "inventory.read",
            "qc.read",
            "files.read",
        }
    ),
    "quality_control": _ADMIN_BASE
    | frozenset(
        {
            "projects.read",
            "production.read",
            "qc.read",
            "qc.write",
            "fulfilment.read",
            "files.read",
        }
    ),
    "finance": _ADMIN_BASE
    | frozenset(
        {
            "customers.read",
            "orders.read",
            "projects.read",
            "payments.read",
            "payments.write",
            "invoices.read",
            "invoices.write",
            "refunds.read",
            "settings.read",
        }
    ),
    "manager_approver": _ADMIN_BASE
    | frozenset(
        {
            "catalog.read",
            "catalog.publish",
            "catalog.archive",
            "content.read",
            "content.publish",
            "content.archive",
            "inventory.read",
            "inventory.adjust",
            "restock_alerts.read",
            "pricing.read",
            "pricing.override",
            "payments.read",
            "refunds.write",
            "orders.read",
            "projects.read",
        }
    ),
    "retail_customer": frozenset(),
    "organization_customer": frozenset(),
}


def validate_roles(roles: object) -> tuple[str, ...]:
    """Validate canonical assignment and return it in stable policy order."""
    if not isinstance(roles, list) or not roles:
        return ()
    if any(not isinstance(role, str) or role not in ROLE_PERMISSIONS for role in roles):
        return ()
    if len(set(roles)) != len(roles):
        return ()

    assigned = set(roles)
    if "super_admin" in assigned and len(assigned) != 1:
        return ()
    customer_roles = assigned & CUSTOMER_ROLES
    internal_roles = assigned & INTERNAL_ROLES
    if customer_roles and (internal_roles or len(customer_roles) != 1):
        return ()

    return tuple(sorted(roles, key=_ROLE_ORDER.__getitem__))


def canonical_roles(user: dict) -> tuple[str, ...]:
    """Resolve active, reviewed users without legacy internal fallback."""
    legacy_role = user.get("role")
    if user.get("access_state", "approved") == "access_review_required":
        return ()
    if user.get("status") != "active":
        if user.get("status") is None and legacy_role == "client" and "roles" not in user:
            return ("retail_customer",)
        return ()

    if "role" in user:
        if not isinstance(legacy_role, str):
            return ()
        if legacy_role in SUPERSEDED_INTERNAL_ROLE_MARKERS or legacy_role != "client":
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
    effective = set()
    for role in roles:
        effective.update(ROLE_PERMISSIONS[role])
    return frozenset(effective)


def has_permission(user: dict, permission: str) -> bool:
    permissions = permissions_for(user)
    return "*" in permissions or permission in permissions


def is_internal(user: dict) -> bool:
    return any(role in INTERNAL_ROLES for role in canonical_roles(user))
