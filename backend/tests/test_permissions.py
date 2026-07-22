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


@pytest.mark.parametrize(
    ("user", "permission", "expected"),
    [
        ({"roles": ["super_admin"], "status": "active", "access_state": "approved"}, "roles.manage", True),
        ({"roles": ["operations"], "status": "active", "access_state": "approved"}, "inventory.write", True),
        ({"roles": ["operations"], "status": "active", "access_state": "approved"}, "pricing.write", False),
        ({"roles": ["operations"], "status": "active", "access_state": "approved"}, "catalog.publish", False),
({"roles": ["operations"], "status": "active", "access_state": "approved"}, "dashboard.read", True),
        ({"roles": ["operations"], "status": "active", "access_state": "approved"}, "organizations.fulfilment.read", True),
        ({"roles": ["operations"], "status": "active", "access_state": "approved"}, "supplier_reference.read", False),
        ({"roles": ["operations"], "status": "active", "access_state": "approved"}, "internships.read", False),
        ({"roles": ["commercial_finance"], "status": "active", "access_state": "approved"}, "pricing.write", True),
        ({"roles": ["commercial_finance"], "status": "active", "access_state": "approved"}, "inventory.write", False),
        ({"roles": ["commercial_finance"], "status": "active", "access_state": "approved"}, "catalog.read", True),
        ({"roles": ["commercial_finance"], "status": "active", "access_state": "approved"}, "catalog.publish", True),
        ({"roles": ["commercial_finance"], "status": "active", "access_state": "approved"}, "catalog.archive", True),
        ({"roles": ["commercial_finance"], "status": "active", "access_state": "approved"}, "catalog.write", False),
        ({"roles": ["commercial_finance"], "status": "active", "access_state": "approved"}, "organizations.manage", True),
        ({"roles": ["commercial_finance"], "status": "active", "access_state": "approved"}, "customers.read", True),
        ({"roles": ["commercial_finance"], "status": "active", "access_state": "approved"}, "customers.manage", True),
        ({"roles": ["commercial_finance"], "status": "active", "access_state": "approved"}, "users.manage", False),
({"roles": ["commercial_finance"], "status": "active", "access_state": "approved"}, "dashboard.read", True),
        ({"roles": ["commercial_finance"], "status": "active", "access_state": "approved"}, "supplier_reference.read", True),
        ({"roles": ["commercial_finance"], "status": "active", "access_state": "approved"}, "supplier_reference.write", True),
        ({"roles": ["commercial_finance"], "status": "active", "access_state": "approved"}, "production.write", False),
        ({"roles": ["commercial_finance"], "status": "active", "access_state": "approved"}, "inventory.adjust", False),
        ({"roles": ["commercial_finance"], "status": "active", "access_state": "approved"}, "inventory.reconcile", False),
        ({"roles": ["commercial_finance"], "status": "active", "access_state": "approved"}, "internships.read", False),
        ({"roles": ["super_admin"], "status": "active", "access_state": "approved"}, "internships.read", True),
    ],
)
def test_policy_matrix(user, permission, expected):
    assert has_permission(user, permission) is expected


def test_policy_version_and_role_labels_are_canonical():
    assert ROLE_POLICY_VERSION == "2026-07-22-v1"
    assert ROLE_LABELS == {
        "super_admin": "Owner",
        "operations": "Operations",
        "commercial_finance": "Commercial & Finance",
        "retail_customer": "Retail Customer",
        "organization_customer": "Organization Customer",
    }


@pytest.mark.parametrize(
    "user",
    [
        {"role": "admin", "roles": [], "access_state": "access_review_required"},
        {"roles": ["operations"], "status": "disabled", "access_state": "approved"},
        {"role": "admin", "roles": ["super_admin"], "status": "active", "access_state": "approved"},
        {"role": "warehouse", "roles": ["operations"], "status": "active"},
        {"roles": ["operations", "commercial_finance"], "status": "active"},
        {"roles": ["operations", "unknown"], "status": "active"},
    ],
)
def test_canonical_roles_fail_closed_for_inactive_legacy_and_invalid_assignments(user):
    assert canonical_roles(user) == ()
    assert permissions_for(user) == frozenset()


def test_access_review_and_disabled_users_have_no_permissions():
    assert permissions_for({"role": "admin", "roles": [], "access_state": "access_review_required"}) == frozenset()
    assert permissions_for({"roles": ["operations"], "status": "disabled", "access_state": "approved"}) == frozenset()
    assert permissions_for({"role": "admin", "roles": ["super_admin"], "status": "active", "access_state": "approved"}) == frozenset()


def test_empty_roles_are_authoritative_and_legacy_client_stays_low_privilege():
    assert canonical_roles({"role": "client"}) == ("retail_customer",)
    assert canonical_roles({"role": "client", "roles": []}) == ()
    assert permissions_for({"role": "client"}) == frozenset()
    assert not is_internal({"role": "client"})
    assert not has_permission({"role": "client"}, "orders.read")


def test_legacy_admin_never_receives_owner_permissions():
    legacy_admin = {"role": "admin", "status": "active", "access_state": "approved"}
    assert canonical_roles(legacy_admin) == ()
    assert not has_permission(legacy_admin, "roles.manage")
    assert not is_internal(legacy_admin)


@pytest.mark.parametrize(
    ("roles", "expected"),
    [
        (["operations"], ("operations",)),
        (["retail_customer"], ("retail_customer",)),
        ([], ()),
        (["super_admin", "operations"], ()),
        (["organization_customer", "retail_customer"], ()),
        (["unknown"], ()),
    ],
)
def test_role_validation_rejects_unknown_and_multiple_role_combinations(roles, expected):
    assert validate_roles(roles) == expected


def test_missing_status_never_grants_internal_authority():
    missing_status_owner = {"roles": ["super_admin"], "access_state": "approved"}
    missing_status_operations = {"roles": ["operations"], "access_state": "approved"}
    assert canonical_roles(missing_status_owner) == ()
    assert canonical_roles(missing_status_operations) == ()
    assert permissions_for(missing_status_owner) == frozenset()
    assert not has_permission(missing_status_operations, "inventory.write")


def test_malformed_legacy_role_marker_fails_closed():
    assert canonical_roles({"role": [], "roles": ["super_admin"], "status": "active"}) == ()
