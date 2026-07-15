from permissions import canonical_roles, has_permission, is_internal, permissions_for


def test_legacy_roles_are_mapped_without_database_migration():
    assert canonical_roles({"role": "admin"}) == ("super_admin",)
    assert canonical_roles({"role": "client"}) == ("retail_customer",)


def test_canonical_roles_are_deduplicated_and_sorted():
    user = {"roles": ["warehouse", "content_editor", "warehouse"]}
    assert canonical_roles(user) == ("content_editor", "warehouse")


def test_internal_role_receives_only_declared_permissions():
    warehouse = {"roles": ["warehouse"]}
    assert has_permission(warehouse, "admin.access")
    assert has_permission(warehouse, "materials.write")
    assert has_permission(warehouse, "inventory.write")
    assert not has_permission(warehouse, "roles.manage")


def test_super_admin_wildcard_and_customer_boundary():
    assert has_permission({"roles": ["super_admin"]}, "roles.manage")
    assert is_internal({"roles": ["super_admin"]})
    assert permissions_for({"roles": ["retail_customer"]}) == frozenset()
    assert not is_internal({"roles": ["organization_customer"]})


def test_catalog_material_inventory_permissions_match_operational_roles():
    catalog = {"roles": ["catalog_manager"]}
    warehouse = {"roles": ["warehouse"]}
    estimator = {"roles": ["sales_estimator"]}
    manager = {"roles": ["manager_approver"]}

    assert has_permission(catalog, "catalog.publish")
    assert has_permission(catalog, "pricing.write")
    assert has_permission(catalog, "materials.read")
    assert not has_permission(catalog, "inventory.write")
    assert has_permission(warehouse, "materials.write")
    assert has_permission(warehouse, "inventory.write")
    assert has_permission(warehouse, "restock_alerts.manage")
    assert not has_permission(warehouse, "inventory.adjust")
    assert has_permission(estimator, "catalog.read")
    assert has_permission(estimator, "materials.read")
    assert has_permission(estimator, "pricing.read")
    assert has_permission(estimator, "inventory.read")
    assert has_permission(manager, "catalog.archive")
    assert has_permission(manager, "materials.archive")
    assert has_permission(manager, "inventory.adjust")
