import re
from pathlib import Path

import pytest
from permissions import (
    ROLE_LABELS,
    ROLE_PERMISSIONS,
    ROLE_POLICY_VERSION,
    canonical_roles,
    has_permission,
    is_internal,
    permissions_for,
    validate_roles,
)

BACKEND_DIR = Path(__file__).resolve().parents[1]
ROUTE_PERMISSION_PATTERN = re.compile(r"""require_permission\(\s*["']([^"']+)["']""")


def active(*roles):
    return {
        "roles": list(roles),
        "status": "active",
        "access_state": "approved",
        "role_policy_version": ROLE_POLICY_VERSION,
    }


@pytest.mark.parametrize(
    ("user", "permission", "expected"),
    [
        (active("super_admin"), "roles.manage", True),
        (active("content_editor"), "content.write", True),
        (active("content_editor"), "content.publish", False),
        (active("catalog_manager"), "catalog.write", True),
        (active("catalog_manager"), "catalog.publish", False),
        (active("warehouse"), "inventory.write", True),
        (active("warehouse"), "inventory.adjust", False),
        (active("order_admin"), "orders.write", True),
        (active("sales_estimator"), "quotes.write", True),
        (active("designer_engineer"), "projects.write", True),
        (active("production"), "production.write", True),
        (active("quality_control"), "qc.write", True),
        (active("finance"), "payments.write", True),
        (active("manager_approver"), "inventory.adjust", True),
        (active("manager_approver"), "catalog.publish", True),
        (active("manager_approver"), "refunds.write", True),
        (active("warehouse", "manager_approver"), "inventory.write", True),
        (active("warehouse", "manager_approver"), "inventory.adjust", True),
        (active("catalog_manager", "manager_approver"), "catalog.write", True),
        (active("catalog_manager", "manager_approver"), "catalog.publish", True),
        (active("finance"), "users.read", False),
        (active("manager_approver"), "users.read", False),
    ],
)
def test_granular_policy_matrix(user, permission, expected):
    assert has_permission(user, permission) is expected


def test_policy_version_and_role_labels_are_canonical():
    assert ROLE_POLICY_VERSION == "2026-07-26-v2"
    assert ROLE_LABELS == {
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


@pytest.mark.parametrize(
    ("roles", "expected"),
    [
        (["warehouse"], ("warehouse",)),
        (
            ["manager_approver", "warehouse"],
            ("warehouse", "manager_approver"),
        ),
        (["retail_customer"], ("retail_customer",)),
        ([], ()),
        (["super_admin", "warehouse"], ()),
        (["organization_customer", "retail_customer"], ()),
        (["warehouse", "warehouse"], ()),
        (["warehouse", "unknown"], ()),
        ("warehouse", ()),
    ],
)
def test_role_validation_allows_additive_internal_roles_only(roles, expected):
    assert validate_roles(roles) == expected


@pytest.mark.parametrize(
    "user",
    [
        active("operations"),
        active("commercial_finance"),
        {"role": "admin", "roles": [], "access_state": "access_review_required"},
        {"roles": ["warehouse"], "status": "disabled", "access_state": "approved"},
        {"role": "warehouse", "roles": ["warehouse"], "status": "active"},
        active("super_admin", "warehouse"),
        active("warehouse", "retail_customer"),
    ],
)
def test_canonical_roles_fail_closed_for_legacy_blocked_and_invalid_assignments(user):
    assert canonical_roles(user) == ()
    assert permissions_for(user) == frozenset()


def test_legacy_client_stays_low_privilege_but_empty_roles_are_authoritative():
    assert canonical_roles({"role": "client"}) == ("retail_customer",)
    assert canonical_roles({"role": "client", "roles": []}) == ()
    assert (
        canonical_roles(
            {
                "role": "client",
                "roles": ["warehouse"],
                "status": "active",
                "access_state": "approved",
                "role_policy_version": ROLE_POLICY_VERSION,
            }
        )
        == ()
    )
    assert not is_internal({"role": "client"})
    assert not has_permission({"role": "client"}, "orders.read")


def test_missing_status_never_grants_internal_authority():
    user = {
        "roles": ["warehouse"],
        "access_state": "approved",
        "role_policy_version": ROLE_POLICY_VERSION,
    }
    assert canonical_roles(user) == ()
    assert not has_permission(user, "inventory.write")


@pytest.mark.parametrize(
    "user",
    [
        {"roles": ["warehouse"], "status": "active"},
        {
            "roles": ["warehouse"],
            "status": "active",
            "access_state": "approved",
        },
        {
            "roles": ["warehouse"],
            "status": "active",
            "access_state": "approved",
            "role_policy_version": "2026-07-22-v1",
        },
        {
            "roles": ["warehouse"],
            "status": "active",
            "access_state": "access_review_required",
            "role_policy_version": ROLE_POLICY_VERSION,
        },
    ],
)
def test_internal_authority_requires_current_explicit_review(user):
    assert canonical_roles(user) == ()
    assert not has_permission(user, "inventory.write")


def test_multi_role_permissions_are_additive_and_internal():
    user = active("order_admin", "sales_estimator")
    assert canonical_roles(user) == ("order_admin", "sales_estimator")
    assert has_permission(user, "orders.write")
    assert has_permission(user, "quotes.write")
    assert is_internal(user)


def test_operational_roles_cannot_cross_identity_governance_boundary():
    """Revalidate DEC-ACCESS-002's Super Admin-only governance boundary.

    The wildcard permission is intentionally reserved for ``super_admin``;
    adding a new operational role must not accidentally expose identity or
    platform settings administration.
    """
    governance_permissions = {"roles.manage", "users.read", "settings.write"}
    for role in ROLE_PERMISSIONS:
        if role in {"super_admin", "retail_customer", "organization_customer"}:
            continue
        user_permissions = permissions_for(active(role))
        assert not user_permissions & governance_permissions
        assert "*" not in user_permissions


def test_super_admin_is_the_only_role_with_unrestricted_authority():
    assert permissions_for(active("super_admin")) == frozenset({"*"})
    for role in ROLE_PERMISSIONS:
        if role == "super_admin":
            continue
        assert "*" not in permissions_for(active(role))


def test_route_permission_inventory_is_declared_and_governance_stays_owner_only():
    route_permissions = set()
    for source_path in BACKEND_DIR.rglob("*.py"):
        relative_parts = source_path.relative_to(BACKEND_DIR).parts
        if any(part in {"tests", ".venv", "__pycache__"} for part in relative_parts):
            continue
        route_permissions.update(
            ROUTE_PERMISSION_PATTERN.findall(source_path.read_text(encoding="utf-8"))
        )

    non_owner_permissions = set().union(
        *(
            permissions
            for role, permissions in ROLE_PERMISSIONS.items()
            if role != "super_admin"
        )
    )
    owner_only = route_permissions - non_owner_permissions

    assert owner_only == {"roles.manage", "settings.write", "users.read"}
    assert "admin.access" in route_permissions
    assert route_permissions - owner_only <= non_owner_permissions
    for role in ROLE_PERMISSIONS:
        if role != "super_admin":
            user = active(role)
            for permission in owner_only:
                assert not has_permission(user, permission)
