from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, field_validator

from audit import append_audit_event
from permissions import (
    ASSIGNABLE_ROLES,
    CUSTOMER_ROLES,
    ROLE_PERMISSIONS,
    canonical_roles,
)


class UserAccessUpdate(BaseModel):
    roles: list[str] = Field(min_length=1)
    status: Literal["active", "disabled"]
    reason: str = Field(min_length=3, max_length=500)

    @field_validator("roles")
    @classmethod
    def validate_roles(cls, roles: list[str]) -> list[str]:
        normalized = sorted(set(roles))
        unknown = sorted(set(normalized) - set(ASSIGNABLE_ROLES))
        if unknown:
            raise ValueError(f"Unknown roles: {', '.join(unknown)}")
        return normalized

    @field_validator("reason")
    @classmethod
    def normalize_reason(cls, reason: str) -> str:
        normalized = reason.strip()
        if len(normalized) < 3:
            raise ValueError("Reason must contain at least 3 characters")
        return normalized


def build_identity_router(*, get_db, require_permission, safe_user) -> APIRouter:
    router = APIRouter(prefix="/admin", tags=["identity"])

    @router.get("/roles")
    async def list_roles(_user: dict = Depends(require_permission("users.read"))):
        return [
            {
                "role": role,
                "kind": "customer" if role in CUSTOMER_ROLES else "internal",
                "permissions": sorted(ROLE_PERMISSIONS[role]),
            }
            for role in ASSIGNABLE_ROLES
        ]

    @router.get("/users")
    async def list_users(_user: dict = Depends(require_permission("users.read"))):
        database = get_db()
        users = (
            await database.users.find({}, {"_id": 0, "password_hash": 0})
            .sort("created_at", -1)
            .to_list(500)
        )
        return [safe_user(user) for user in users]

    @router.put("/users/{user_id}/access")
    async def update_user_access(
        user_id: str,
        request: UserAccessUpdate,
        actor: dict = Depends(require_permission("roles.manage")),
    ):
        database = get_db()
        before = await database.users.find_one({"id": user_id})
        if not before:
            raise HTTPException(status_code=404, detail="User not found")

        removes_super_admin = "super_admin" in canonical_roles(before) and (
            request.status == "disabled" or "super_admin" not in request.roles
        )
        if removes_super_admin:
            active_super_admins = await database.users.count_documents(
                {
                    "status": {"$ne": "disabled"},
                    "$or": [
                        {"roles": "super_admin"},
                        {"role": "admin"},
                    ],
                }
            )
            if active_super_admins <= 1:
                raise HTTPException(
                    status_code=409,
                    detail="The final active super admin cannot be disabled or demoted",
                )

        updated_at = datetime.now(timezone.utc).isoformat()
        result = await database.users.update_one(
            {"id": user_id},
            {
                "$set": {
                    "roles": request.roles,
                    "status": request.status,
                    "updated_at": updated_at,
                }
            },
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")

        after = await database.users.find_one({"id": user_id})
        await append_audit_event(
            database,
            actor=actor,
            action="user.access_updated",
            target_type="user",
            target_id=user_id,
            before=before,
            after=after,
            reason=request.reason,
        )
        return safe_user(after)

    @router.get("/audit-events")
    async def list_audit_events(
        limit: int = Query(default=100, ge=1, le=200),
        _user: dict = Depends(require_permission("audit.read")),
    ):
        database = get_db()
        return (
            await database.audit_events.find({}, {"_id": 0})
            .sort("created_at", -1)
            .to_list(limit)
        )

    return router
