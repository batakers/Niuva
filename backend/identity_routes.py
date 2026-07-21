from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field, field_validator

from audit import append_identity_audit_event
from permissions import (
    ASSIGNABLE_ROLES,
    CUSTOMER_ROLES,
    ROLE_POLICY_VERSION,
    ROLE_PERMISSIONS,
    canonical_roles,
)


class UserAccessUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    roles: list[str] = Field(min_length=1, max_length=1)
    status: Literal["active", "disabled"]
    access_state: Literal["approved", "access_review_required"]
    reason_code: Literal[
        "role_review_approved",
        "role_access_removed",
        "emergency_override",
        "policy_migration_v1",
    ]

    @field_validator("roles")
    @classmethod
    def validate_roles(cls, roles: list[str]) -> list[str]:
        if roles[0] not in ASSIGNABLE_ROLES:
            raise ValueError(f"Unknown role: {roles[0]}")
        return roles


def _access_audit_projection(user: dict) -> dict:
    projection = {"roles": list(canonical_roles(user))}
    projection.update(
        {field: user[field] for field in ("access_state", "status") if field in user}
    )
    return projection


_POLICY_STATE_ID = "identity_access_policy"
_FINAL_OWNER_DETAIL = "The final approved Owner cannot be disabled or demoted"


def _is_approved_owner(user: dict) -> bool:
    return canonical_roles(user) == ("super_admin",)


async def _approved_owner_count(database, *, session) -> int:
    count = 0
    async for user in database.users.find({}, session=session):
        if _is_approved_owner(user):
            count += 1
    return count


def build_identity_router(
    *, get_db, get_transaction_guard, require_permission, safe_user
) -> APIRouter:
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
        guard = get_transaction_guard()

        async def mutate(session):
            await database.identity_policy_state.update_one(
                {"_id": _POLICY_STATE_ID},
                {
                    "$inc": {"version": 1},
                    "$setOnInsert": {
                        "key": _POLICY_STATE_ID,
                        "approved_owner_count": 0,
                        "policy_version": ROLE_POLICY_VERSION,
                    },
                },
                upsert=True,
                session=session,
            )
            before = await database.users.find_one({"id": user_id}, session=session)
            if not before:
                raise HTTPException(status_code=404, detail="User not found")

            owner_count = await _approved_owner_count(database, session=session)
            after_candidate = {
                **before,
                "roles": request.roles,
                "status": request.status,
                "access_state": request.access_state,
            }
            after_candidate.pop("role", None)
            owner_delta = int(_is_approved_owner(after_candidate)) - int(
                _is_approved_owner(before)
            )
            if owner_count + owner_delta < 1:
                raise HTTPException(status_code=409, detail=_FINAL_OWNER_DETAIL)

            updated_at = datetime.now(timezone.utc).isoformat()
            result = await database.users.update_one(
                {"id": user_id},
                {
                    "$set": {
                        "roles": request.roles,
                        "status": request.status,
                        "access_state": request.access_state,
                        "role_policy_version": ROLE_POLICY_VERSION,
                        "updated_at": updated_at,
                    },
                    "$unset": {"role": ""},
                },
                session=session,
            )
            if result.matched_count == 0:
                raise HTTPException(status_code=404, detail="User not found")

            await database.identity_policy_state.update_one(
                {"_id": _POLICY_STATE_ID},
                {
                    "$set": {
                        "approved_owner_count": owner_count + owner_delta,
                        "policy_version": ROLE_POLICY_VERSION,
                        "updated_at": updated_at,
                    }
                },
                session=session,
            )
            after = await database.users.find_one({"id": user_id}, session=session)
            if after is None:
                raise RuntimeError("Updated user disappeared before audit")
            await append_identity_audit_event(
                database,
                actor_user_id=actor["id"],
                action="user.access_updated",
                target_type="user",
                target_id=user_id,
                previous=_access_audit_projection(before),
                result=_access_audit_projection(after),
                reason_code=request.reason_code,
                policy_version=ROLE_POLICY_VERSION,
                session=session,
            )
            return safe_user(after)

        return await guard.run(
            mutate,
            operation_name="identity.access.update",
            retry_safe=False,
        )

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
