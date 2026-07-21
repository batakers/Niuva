import uuid
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from audit import append_identity_audit_event
from permissions import ROLE_POLICY_VERSION, canonical_roles, has_permission

ORGANIZATION_MEMBER_ROLES = frozenset(
    {"owner", "project_pic", "approver", "finance", "viewer"}
)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def without_mongo_id(document: dict) -> dict:
    return {key: value for key, value in document.items() if key != "_id"}


def _organization_audit_projection(organization: dict) -> dict:
    return {
        "organization_id": organization["id"],
        "status": organization["status"],
    }


def _membership_audit_projection(membership: dict) -> dict:
    return {
        "organization_id": membership["organization_id"],
        "membership_id": membership["id"],
        "member_role": membership["member_role"],
        "status": membership["status"],
    }


class OrganizationPayload(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    legal_name: str = Field(min_length=2, max_length=250)
    tax_id: str = Field(default="", max_length=100)
    status: Literal["active", "inactive"] = "active"

    @field_validator("name", "legal_name", "tax_id")
    @classmethod
    def normalize_text(cls, value: str) -> str:
        return value.strip()


class OrganizationMemberCreate(BaseModel):
    user_id: str = Field(min_length=1, max_length=100)
    member_role: str

    @field_validator("user_id")
    @classmethod
    def normalize_user_id(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("User ID is required")
        return normalized

    @field_validator("member_role")
    @classmethod
    def validate_member_role(cls, value: str) -> str:
        if value not in ORGANIZATION_MEMBER_ROLES:
            raise ValueError(f"Unknown organization member role: {value}")
        return value


class OrganizationMemberUpdate(BaseModel):
    member_role: str

    @field_validator("member_role")
    @classmethod
    def validate_member_role(cls, value: str) -> str:
        if value not in ORGANIZATION_MEMBER_ROLES:
            raise ValueError(f"Unknown organization member role: {value}")
        return value


def build_organization_router(
    *, get_db, require_permission, get_current_user, has_permission=has_permission
) -> APIRouter:
    router = APIRouter(tags=["organizations"])

    @router.get("/admin/organizations")
    async def list_organizations(
        user: dict = Depends(get_current_user),
    ):
        management_view = has_permission(user, "organizations.manage")
        if not management_view and not has_permission(
            user, "organizations.fulfilment.read"
        ):
            raise HTTPException(
                status_code=403,
                detail="Permission required: organizations.fulfilment.read",
            )
        database = get_db()
        organizations = (
            await database.organizations.find({}, {"_id": 0})
            .sort("created_at", -1)
            .to_list(200)
        )
        organization_ids = [item["id"] for item in organizations]
        memberships = []
        if organization_ids:
            memberships = (
                await database.organization_memberships.find(
                    {"organization_id": {"$in": organization_ids}}, {"_id": 0}
                )
                .sort("created_at", 1)
                .to_list(2000)
            )

        memberships_by_organization: dict[str, list[dict]] = {}
        for membership in memberships:
            memberships_by_organization.setdefault(
                membership["organization_id"], []
            ).append(membership)

        if management_view:
            return [
                {
                    **without_mongo_id(organization),
                    "memberships": memberships_by_organization.get(
                        organization["id"], []
                    ),
                }
                for organization in organizations
            ]

        membership_fields = (
            "id",
            "organization_id",
            "user_id",
            "member_role",
            "status",
        )
        return [
            {
                "id": organization["id"],
                "name": organization["name"],
                "status": organization["status"],
                "memberships": [
                    {
                        field: membership[field]
                        for field in membership_fields
                        if field in membership
                    }
                    for membership in memberships_by_organization.get(
                        organization["id"], []
                    )
                    if membership.get("status") == "active"
                ],
            }
            for organization in organizations
        ]

    @router.post(
        "/admin/organizations",
        status_code=status.HTTP_201_CREATED,
    )
    async def create_organization(
        request: OrganizationPayload,
        actor: dict = Depends(require_permission("organizations.manage")),
    ):
        database = get_db()
        timestamp = now_iso()
        organization = {
            "id": str(uuid.uuid4()),
            **request.model_dump(),
            "created_at": timestamp,
            "updated_at": timestamp,
        }
        await database.organizations.insert_one(dict(organization))
        await append_identity_audit_event(
            database,
            actor_user_id=actor["id"],
            action="organization.created",
            target_type="organization",
            target_id=organization["id"],
            previous=None,
            result=_organization_audit_projection(organization),
            reason_code="organization_created",
            policy_version=ROLE_POLICY_VERSION,
        )
        return organization

    @router.put("/admin/organizations/{organization_id}")
    async def update_organization(
        organization_id: str,
        request: OrganizationPayload,
        actor: dict = Depends(require_permission("organizations.manage")),
    ):
        database = get_db()
        before = await database.organizations.find_one({"id": organization_id})
        if not before:
            raise HTTPException(status_code=404, detail="Organization not found")

        changes = {**request.model_dump(), "updated_at": now_iso()}
        result = await database.organizations.update_one(
            {"id": organization_id}, {"$set": changes}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Organization not found")
        after = await database.organizations.find_one({"id": organization_id})
        await append_identity_audit_event(
            database,
            actor_user_id=actor["id"],
            action="organization.updated",
            target_type="organization",
            target_id=organization_id,
            previous=_organization_audit_projection(before),
            result=_organization_audit_projection(after),
            reason_code="organization_updated",
            policy_version=ROLE_POLICY_VERSION,
        )
        return without_mongo_id(after)

    @router.post(
        "/admin/organizations/{organization_id}/members",
        status_code=status.HTTP_201_CREATED,
    )
    async def add_organization_member(
        organization_id: str,
        request: OrganizationMemberCreate,
        actor: dict = Depends(require_permission("organizations.manage")),
    ):
        database = get_db()
        organization = await database.organizations.find_one(
            {"id": organization_id, "status": "active"}
        )
        if not organization:
            raise HTTPException(status_code=404, detail="Active organization not found")

        member_user = await database.users.find_one({"id": request.user_id})
        if not member_user:
            raise HTTPException(status_code=404, detail="User not found")
        if "organization_customer" not in canonical_roles(member_user):
            raise HTTPException(
                status_code=422,
                detail="User must have the organization_customer role",
            )

        existing = await database.organization_memberships.find_one(
            {"organization_id": organization_id, "user_id": request.user_id}
        )
        timestamp = now_iso()
        if existing and existing.get("status") == "active":
            raise HTTPException(
                status_code=409, detail="Active membership already exists"
            )

        if existing:
            await database.organization_memberships.update_one(
                {"id": existing["id"], "status": {"$ne": "active"}},
                {
                    "$set": {
                        "member_role": request.member_role,
                        "status": "active",
                        "updated_at": timestamp,
                    }
                },
            )
            membership = await database.organization_memberships.find_one(
                {"id": existing["id"]}
            )
            action = "organization.member_reactivated"
        else:
            membership = {
                "id": str(uuid.uuid4()),
                "organization_id": organization_id,
                "user_id": request.user_id,
                "member_role": request.member_role,
                "status": "active",
                "created_at": timestamp,
                "updated_at": timestamp,
            }
            await database.organization_memberships.insert_one(dict(membership))
            action = "organization.member_added"

        await append_identity_audit_event(
            database,
            actor_user_id=actor["id"],
            action=action,
            target_type="organization_membership",
            target_id=membership["id"],
            previous=_membership_audit_projection(existing) if existing else None,
            result=_membership_audit_projection(membership),
            reason_code=action.replace(".", "_"),
            policy_version=ROLE_POLICY_VERSION,
        )
        return without_mongo_id(membership)

    @router.put("/admin/organizations/{organization_id}/members/{membership_id}")
    async def update_organization_member(
        organization_id: str,
        membership_id: str,
        request: OrganizationMemberUpdate,
        actor: dict = Depends(require_permission("organizations.manage")),
    ):
        database = get_db()
        before = await database.organization_memberships.find_one(
            {
                "id": membership_id,
                "organization_id": organization_id,
                "status": "active",
            }
        )
        if not before:
            raise HTTPException(status_code=404, detail="Active membership not found")

        await database.organization_memberships.update_one(
            {"id": membership_id, "organization_id": organization_id},
            {
                "$set": {
                    "member_role": request.member_role,
                    "updated_at": now_iso(),
                }
            },
        )
        after = await database.organization_memberships.find_one({"id": membership_id})
        await append_identity_audit_event(
            database,
            actor_user_id=actor["id"],
            action="organization.member_updated",
            target_type="organization_membership",
            target_id=membership_id,
            previous=_membership_audit_projection(before),
            result=_membership_audit_projection(after),
            reason_code="organization_member_updated",
            policy_version=ROLE_POLICY_VERSION,
        )
        return without_mongo_id(after)

    @router.delete("/admin/organizations/{organization_id}/members/{membership_id}")
    async def archive_organization_member(
        organization_id: str,
        membership_id: str,
        actor: dict = Depends(require_permission("organizations.manage")),
    ):
        database = get_db()
        before = await database.organization_memberships.find_one(
            {
                "id": membership_id,
                "organization_id": organization_id,
                "status": "active",
            }
        )
        if not before:
            raise HTTPException(status_code=404, detail="Active membership not found")

        result = await database.organization_memberships.update_one(
            {
                "id": membership_id,
                "organization_id": organization_id,
                "status": "active",
            },
            {"$set": {"status": "inactive", "updated_at": now_iso()}},
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Active membership not found")
        after = await database.organization_memberships.find_one({"id": membership_id})
        await append_identity_audit_event(
            database,
            actor_user_id=actor["id"],
            action="organization.member_archived",
            target_type="organization_membership",
            target_id=membership_id,
            previous=_membership_audit_projection(before),
            result=_membership_audit_projection(after),
            reason_code="organization_member_archived",
            policy_version=ROLE_POLICY_VERSION,
        )
        return without_mongo_id(after)

    @router.get("/organizations/mine")
    async def list_my_organizations(
        user: dict = Depends(get_current_user),
    ):
        database = get_db()
        memberships = (
            await database.organization_memberships.find(
                {"user_id": user["id"], "status": "active"}, {"_id": 0}
            )
            .sort("created_at", 1)
            .to_list(200)
        )
        if not memberships:
            return []

        membership_by_organization = {
            membership["organization_id"]: membership for membership in memberships
        }
        organizations = (
            await database.organizations.find(
                {
                    "id": {"$in": list(membership_by_organization)},
                    "status": "active",
                },
                {"_id": 0},
            )
            .sort("created_at", 1)
            .to_list(200)
        )
        return [
            {
                **without_mongo_id(organization),
                "membership_id": membership_by_organization[organization["id"]]["id"],
                "member_role": membership_by_organization[organization["id"]][
                    "member_role"
                ],
            }
            for organization in organizations
        ]

    return router
