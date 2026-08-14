import asyncio
import inspect
import os
import sys
from pathlib import Path

import pytest
from fastapi import HTTPException

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("MONGO_URL", "mongodb://route-authorization-test.invalid")
os.environ.setdefault("DB_NAME", "niuva_route_authorization_test")
os.environ.setdefault("JWT_SECRET", "route-authorization-test-secret-at-least-32-bytes")
os.environ.setdefault("ADMIN_EMAIL", "admin@niuva.com")
os.environ.setdefault("ADMIN_PASSWORD", "Admin route audit password 2026")
os.environ.setdefault("PUBLIC_SITE_URL", "https://testserver")
os.environ.setdefault(
    "AUTH_SESSION_CSRF_KEY",
    "route-authorization-test-csrf-key-at-least-32-bytes",
)

import server  # noqa: E402
from permissions import (  # noqa: E402
    ROLE_PERMISSIONS,
    ROLE_POLICY_VERSION,
    has_permission,
)


def _active(role: str) -> dict:
    return {
        "id": f"route-audit-{role}",
        "roles": [role],
        "status": "active",
        "access_state": "approved",
        "role_policy_version": ROLE_POLICY_VERSION,
    }


def _effective_routes():
    for route in server.app.routes:
        contexts = getattr(route, "effective_route_contexts", None)
        if contexts is not None:
            yield from contexts()


def _dependencies(dependant):
    for dependency in dependant.dependencies:
        yield dependency
        yield from _dependencies(dependency)


def _permission_dependencies(route):
    for dependency in _dependencies(route.dependant):
        try:
            closure = inspect.getclosurevars(dependency.call).nonlocals
        except TypeError:
            continue
        permission = closure.get("permission")
        if isinstance(permission, str):
            yield permission, dependency.call


async def _assert_denied(dependency, actor):
    with pytest.raises(HTTPException) as denied:
        await dependency(actor)
    assert denied.value.status_code == 403
    assert denied.value.detail == "Forbidden"


def test_every_admin_route_denies_each_role_without_its_declared_permission():
    """Keep negative RBAC coverage aligned with FastAPI's effective routes."""

    admin_routes = [
        route for route in _effective_routes() if route.path.startswith("/api/admin")
    ]
    assert admin_routes, "The effective Admin route inventory must not be empty"

    for route in admin_routes:
        guards = list(_permission_dependencies(route))
        assert guards, f"{sorted(route.methods)} {route.path} has no permission guard"

        for permission, dependency in guards:
            for role in ROLE_PERMISSIONS:
                actor = _active(role)
                if has_permission(actor, permission):
                    continue
                asyncio.run(_assert_denied(dependency, actor))
