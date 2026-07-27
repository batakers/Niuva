import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field

from audit import append_identity_governance_event
from password_policy import validate_password
from permissions import CUSTOMER_ROLES, INTERNAL_ROLES, validate_roles


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


class StaffInvitationRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    roles: list[str] = Field(min_length=1, max_length=10)
    reason: str = Field(min_length=3, max_length=500)
    expires_in_hours: int = Field(default=72, ge=1, le=168)


class StaffInvitationAcceptRequest(BaseModel):
    token: str = Field(min_length=32, max_length=500)
    password: str = Field(min_length=1, max_length=256)


class StaffRoleAssignmentRequest(BaseModel):
    roles: list[str] = Field(min_length=1, max_length=10)
    expected_version: int = Field(ge=1)
    reason: str = Field(min_length=3, max_length=500)


class StaffStatusRequest(BaseModel):
    expected_version: int = Field(ge=1)
    reason: str = Field(min_length=3, max_length=500)


def _internal_roles(roles: list[str]) -> tuple[str, ...]:
    canonical = validate_roles(roles)
    if not canonical or any(role not in INTERNAL_ROLES for role in canonical):
        raise HTTPException(status_code=422, detail="Invalid internal role assignment")
    return canonical


def _projection(record: dict) -> dict:
    return {
        key: record.get(key)
        for key in (
            "id",
            "email",
            "name",
            "roles",
            "status",
            "access_state",
            "version",
            "expires_at",
        )
        if key in record
    }


def _is_customer_account(record: dict) -> bool:
    roles = record.get("roles")
    return record.get("role") == "client" or (
        isinstance(roles, list) and bool(set(roles) & CUSTOMER_ROLES)
    )


def _conflict(record: dict):
    raise HTTPException(
        status_code=409,
        detail={
            "code": "version_conflict",
            "current_version": record.get("version", 1),
            "current_status": record.get("status"),
        },
    )


def build_identity_router(
    *, get_db, get_transaction_guard, require_permission, safe_user, hash_password
) -> APIRouter:
    router = APIRouter(tags=["identity"])

    @router.get("/admin/users")
    async def list_users(_user: dict = Depends(require_permission("users.read"))):
        database = get_db()
        users = (
            await database.users.find({}, {"_id": 0, "password_hash": 0})
            .sort("created_at", -1)
            .to_list(500)
        )
        return [safe_user(user) for user in users if not _is_customer_account(user)]

    @router.post("/admin/staff-invitations", status_code=201)
    async def invite_staff(
        payload: StaffInvitationRequest,
        actor: dict = Depends(require_permission("roles.manage")),
    ):
        database = get_db()
        guard = get_transaction_guard()
        email = payload.email.lower()
        roles = _internal_roles(payload.roles)
        raw_token = secrets.token_urlsafe(32)
        timestamp = datetime.now(timezone.utc)
        invitation = {
            "id": str(uuid.uuid4()),
            "name": payload.name.strip(),
            "email": email,
            "roles": list(roles),
            "token_hash": token_hash(raw_token),
            "status": "pending",
            "version": 1,
            "expires_at": (timestamp + timedelta(hours=payload.expires_in_hours)).isoformat(),
            "created_by": actor["id"],
            "created_at": timestamp.isoformat(),
            "updated_at": timestamp.isoformat(),
        }

        async def mutate(session):
            if await database.users.find_one({"email": email}, session=session):
                raise HTTPException(status_code=409, detail={"code": "email_in_use"})
            pending = await database.staff_invitations.find_one(
                {"email": email, "status": "pending"}, session=session
            )
            if pending:
                raise HTTPException(status_code=409, detail={"code": "invitation_pending"})
            await database.staff_invitations.insert_one(invitation, session=session)
            await append_identity_governance_event(
                database,
                actor=actor,
                action="identity.staff_invited",
                target_type="staff_invitation",
                target_id=invitation["id"],
                before=None,
                after=invitation,
                reason=payload.reason,
                session=session,
            )

        await guard.run(mutate, operation_name="identity.invite_staff")
        return {**_projection(invitation), "setup_token": raw_token}

    @router.post("/auth/staff-invitations/accept", status_code=201)
    async def accept_staff_invitation(payload: StaffInvitationAcceptRequest):
        database = get_db()
        guard = get_transaction_guard()
        validate_password(payload.password)
        digest = token_hash(payload.token)
        created = {}

        async def mutate(session):
            invitation = await database.staff_invitations.find_one(
                {"token_hash": digest}, session=session
            )
            if not invitation or invitation.get("status") != "pending":
                raise HTTPException(status_code=410, detail={"code": "invitation_unavailable"})
            expires_at = datetime.fromisoformat(invitation["expires_at"])
            if expires_at <= datetime.now(timezone.utc):
                raise HTTPException(status_code=410, detail={"code": "invitation_expired"})
            if await database.users.find_one({"email": invitation["email"]}, session=session):
                raise HTTPException(status_code=409, detail={"code": "email_in_use"})
            user = {
                "id": str(uuid.uuid4()),
                "name": invitation["name"],
                "email": invitation["email"],
                "password_hash": hash_password(payload.password),
                "roles": list(_internal_roles(invitation["roles"])),
                "status": "active",
                "access_state": "approved",
                "token_version": 0,
                "version": 1,
                "created_at": now_iso(),
                "updated_at": now_iso(),
            }
            await database.users.insert_one(user, session=session)
            await database.staff_invitations.update_one(
                {"id": invitation["id"], "status": "pending"},
                {"$set": {"status": "accepted", "accepted_at": now_iso(), "updated_at": now_iso()}},
                session=session,
            )
            system_actor = {"id": user["id"], "email": user["email"]}
            await append_identity_governance_event(
                database,
                actor=system_actor,
                action="identity.staff_invitation_accepted",
                target_type="user",
                target_id=user["id"],
                before=None,
                after=user,
                reason="Undangan staf diterima dan password disiapkan",
                session=session,
            )
            created.update(user)

        await guard.run(mutate, operation_name="identity.accept_staff_invitation")
        return safe_user(created)

    async def update_staff(
        *,
        user_id: str,
        expected_version: int,
        reason: str,
        actor: dict,
        action: str,
        operation_name: str,
        changes: dict,
    ):
        database = get_db()
        guard = get_transaction_guard()
        result = {}

        async def mutate(session):
            current = await database.users.find_one({"id": user_id}, session=session)
            if not current:
                raise HTTPException(status_code=404, detail="Staff not found")
            if _is_customer_account(current):
                raise HTTPException(
                    status_code=409,
                    detail={"code": "customer_account_boundary"},
                )
            if current.get("version", 1) != expected_version:
                _conflict(current)
            if actor.get("id") == user_id:
                raise HTTPException(status_code=409, detail={"code": "self_access_change_forbidden"})
            next_record = {
                **current,
                **changes,
                "version": expected_version + 1,
                "token_version": current.get("token_version", 0) + 1,
                "updated_at": now_iso(),
            }
            write = await database.users.update_one(
                {"id": user_id, "version": expected_version},
                {
                    "$set": {
                        key: next_record[key]
                        for key in changes.keys() | {"version", "token_version", "updated_at"}
                    },
                    "$unset": {"role": ""},
                },
                session=session,
            )
            if write.matched_count == 0:
                latest = await database.users.find_one({"id": user_id}, session=session)
                _conflict(latest or current)
            await append_identity_governance_event(
                database,
                actor=actor,
                action=action,
                target_type="user",
                target_id=user_id,
                before=current,
                after=next_record,
                reason=reason,
                session=session,
            )
            result.update(next_record)

        await guard.run(mutate, operation_name=operation_name)
        return safe_user(result)

    @router.put("/admin/staff/{user_id}/roles")
    async def assign_staff_roles(
        user_id: str,
        payload: StaffRoleAssignmentRequest,
        actor: dict = Depends(require_permission("roles.manage")),
    ):
        roles = list(_internal_roles(payload.roles))
        return await update_staff(
            user_id=user_id,
            expected_version=payload.expected_version,
            reason=payload.reason,
            actor=actor,
            action="identity.staff_roles_updated",
            operation_name="identity.assign_staff_roles",
            changes={"roles": roles, "access_state": "approved"},
        )

    @router.post("/admin/staff/{user_id}/deactivate")
    async def deactivate_staff(
        user_id: str,
        payload: StaffStatusRequest,
        actor: dict = Depends(require_permission("roles.manage")),
    ):
        return await update_staff(
            user_id=user_id,
            expected_version=payload.expected_version,
            reason=payload.reason,
            actor=actor,
            action="identity.staff_deactivated",
            operation_name="identity.deactivate_staff",
            changes={"status": "disabled"},
        )

    @router.post("/admin/staff/{user_id}/reactivate")
    async def reactivate_staff(
        user_id: str,
        payload: StaffStatusRequest,
        actor: dict = Depends(require_permission("roles.manage")),
    ):
        return await update_staff(
            user_id=user_id,
            expected_version=payload.expected_version,
            reason=payload.reason,
            actor=actor,
            action="identity.staff_reactivated",
            operation_name="identity.reactivate_staff",
            changes={"status": "active"},
        )

    return router
