import pytest

from permissions import (
    ROLE_LABELS,
    ROLE_POLICY_VERSION,
    canonical_roles,
    has_permission,
    is_internal,
    permissions_for,
    validate_roles,
)


def active(*roles):
    return {"roles": list(roles), "status": "active", "access_state": "approved"}


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
    assert not is_internal({"role": "client"})
    assert not has_permission({"role": "client"}, "orders.read")


def test_missing_status_never_grants_internal_authority():
    user = {"roles": ["warehouse"], "access_state": "approved"}
    assert canonical_roles(user) == ()
    assert not has_permission(user, "inventory.write")


def test_multi_role_permissions_are_additive_and_internal():
    user = active("order_admin", "sales_estimator")
    assert canonical_roles(user) == ("order_admin", "sales_estimator")
    assert has_permission(user, "orders.write")
    assert has_permission(user, "quotes.write")
    assert is_internal(user)
