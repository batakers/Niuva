LEGACY_ROLE_MAP = {
    "admin": ("super_admin",),
    "client": ("retail_customer",),
}

CUSTOMER_ROLES = frozenset({"retail_customer", "organization_customer"})
INTERNAL_ROLES = frozenset(
    {
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
    }
)
ASSIGNABLE_ROLES = tuple(sorted(CUSTOMER_ROLES | INTERNAL_ROLES))

ROLE_PERMISSIONS = {
    "retail_customer": frozenset(),
    "organization_customer": frozenset(),
    "content_editor": frozenset(
        {
            "admin.access",
            "content.read",
            "content.write",
            "media.read",
            "media.write",
        }
    ),
    "catalog_manager": frozenset(
        {
            "admin.access",
            "catalog.read",
            "catalog.write",
            "catalog.publish",
            "materials.read",
            "pricing.read",
            "pricing.write",
        }
    ),
    "warehouse": frozenset(
        {
            "admin.access",
            "materials.read",
            "materials.write",
            "inventory.read",
            "inventory.write",
            "restock_alerts.read",
            "restock_alerts.manage",
        }
    ),
    "order_admin": frozenset(
        {
            "admin.access",
            "orders.read",
            "orders.write",
            "customers.read",
            "notifications.write",
        }
    ),
    "sales_estimator": frozenset(
        {
            "admin.access",
            "inquiries.read",
            "inquiries.write",
            "quotes.read",
            "quotes.write",
            "catalog.read",
            "materials.read",
            "pricing.read",
            "inventory.read",
            "projects.read",
        }
    ),
    "designer_engineer": frozenset(
        {
            "admin.access",
            "designs.read",
            "designs.write",
            "projects.read",
            "files.read",
        }
    ),
    "production": frozenset(
        {
            "admin.access",
            "production.read",
            "production.write",
            "orders.read",
            "projects.read",
            "inventory.read",
        }
    ),
    "quality_control": frozenset(
        {
            "admin.access",
            "qc.read",
            "qc.write",
            "production.read",
            "orders.read",
            "projects.read",
        }
    ),
    "finance": frozenset(
        {
            "admin.access",
            "payments.read",
            "payments.write",
            "invoices.read",
            "invoices.write",
            "refunds.write",
            "orders.read",
            "projects.read",
        }
    ),
    "manager_approver": frozenset(
        {
            "admin.access",
            "users.read",
            "organizations.read",
            "audit.read",
            "approvals.read",
            "approvals.write",
            "catalog.read",
            "catalog.write",
            "catalog.publish",
            "catalog.archive",
            "materials.read",
            "materials.write",
            "materials.archive",
            "pricing.read",
            "pricing.write",
            "inventory.read",
            "inventory.write",
            "inventory.adjust",
            "restock_alerts.read",
            "restock_alerts.manage",
            "orders.read",
            "projects.read",
        }
    ),
    "super_admin": frozenset({"*"}),
}


def canonical_roles(user: dict) -> tuple[str, ...]:
    roles = user.get("roles")
    if roles:
        valid = {role for role in roles if role in ROLE_PERMISSIONS}
        return tuple(sorted(valid))
    return LEGACY_ROLE_MAP.get(user.get("role"), tuple())


def permissions_for(user: dict) -> frozenset[str]:
    permissions: set[str] = set()
    for role in canonical_roles(user):
        permissions.update(ROLE_PERMISSIONS[role])
    return frozenset(permissions)


def has_permission(user: dict, permission: str) -> bool:
    permissions = permissions_for(user)
    return "*" in permissions or permission in permissions


def is_internal(user: dict) -> bool:
    return any(role in INTERNAL_ROLES for role in canonical_roles(user))
