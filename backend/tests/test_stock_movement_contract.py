"""The stock movement ledger contract: append and read, never rewrite.

Per Master Spec, corrections happen through new adjustment movements, not by
editing or deleting ledger entries. That is only true as long as no route can
mutate one, so this test pins the whole surface by inspecting the routers
rather than trusting the absence to persist by convention.
"""

from fastapi.routing import APIRoute

from b2b_routes import build_b2b_router
from inventory_routes import build_inventory_router

READ_OR_APPEND = {"GET", "POST", "HEAD", "OPTIONS"}


def route_methods(router):
    return [
        (route.path, sorted(route.methods))
        for route in router.routes
        if isinstance(route, APIRoute)
    ]


def build_routers():
    def permission_dependency(_permission):
        async def dependency():
            return {"id": "actor"}

        return dependency

    inventory = build_inventory_router(
        get_service=lambda: None,
        require_permission=permission_dependency,
        has_permission=lambda actor, permission: True,
    )
    b2b = build_b2b_router(
        get_db=lambda: None,
        get_transaction_guard=lambda: None,
        require_permission=permission_dependency,
        throttle_intake=lambda _request: None,
    )
    return inventory, b2b


def test_no_route_can_update_or_delete_a_movement():
    inventory, b2b = build_routers()

    for router in (inventory, b2b):
        for path, methods in route_methods(router):
            assert set(methods) <= READ_OR_APPEND, (path, methods)


def test_the_only_movement_write_is_appending_one():
    inventory, _b2b = build_routers()

    movement_writes = [
        path
        for path, methods in route_methods(inventory)
        if "/movements" in path and "POST" in methods
    ]
    assert movement_writes == ["/admin/inventory/movements"]


def test_movement_history_is_readable_by_subject_and_by_source():
    """The deep links rely on these filters staying on the read surface."""
    inventory, _b2b = build_routers()

    list_route = next(
        route
        for route in inventory.routes
        if isinstance(route, APIRoute)
        and route.path == "/admin/inventory/movements"
        and route.methods == {"GET"}
    )
    parameters = {
        parameter.name for parameter in list_route.dependant.query_params
    }
    assert {"subject_type", "subject_id", "reference_id"} <= parameters
