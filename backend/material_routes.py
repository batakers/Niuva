import re
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from audit import append_audit_event
from material_pricing import (
    resolve_effective_price,
    resolve_next_scheduled_price,
)


BaseUnit = Literal["pcs", "g", "kg", "mm", "cm", "m", "ml", "l", "sheet", "roll"]


class MaterialError(Exception):
    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message

    def payload(self) -> dict:
        return {"code": self.code, "message": self.message}


class MaterialPayload(BaseModel):
    model_config = ConfigDict(extra="ignore")

    sku: str = Field(default="", max_length=100)
    name: str = Field(min_length=2, max_length=200)
    description: str = Field(default="", max_length=2000)
    color: str = Field(default="", max_length=100)
    base_unit: BaseUnit | None = None
    supplier_reference: str = Field(default="", max_length=200)
    waste_percentage: Decimal = Field(default=Decimal("0"), ge=0, le=100)
    reorder_point: Decimal = Field(default=Decimal("0"), ge=0)
    lead_time_days: int = Field(default=0, ge=0, le=3650)
    inventory_tracking_enabled: bool = False
    setup_status: Literal["needs_review", "ready"] = "needs_review"
    status: Literal["active", "archived"] = "active"
    active: bool | None = None

    @field_validator("sku")
    @classmethod
    def normalize_sku(cls, value: str) -> str:
        normalized = value.strip().upper()
        if normalized and len(normalized) < 2:
            raise ValueError("sku must contain at least 2 characters")
        return normalized

    @model_validator(mode="after")
    def validate_ready_setup(self):
        if self.setup_status == "ready" and self.base_unit is None:
            raise ValueError("base_unit is required when setup_status is ready")
        return self


class MaterialUpdatePayload(MaterialPayload):
    """Accept a partial material update while preserving field validation."""

    name: str | None = Field(default=None, min_length=2, max_length=200)

class SupplierReferencePayload(BaseModel):
    supplier_reference: str = Field(default="", max_length=200)

class PriceVersionPayload(BaseModel):
    amount: int = Field(ge=0)
    currency: Literal["IDR"] = "IDR"
    price_unit: BaseUnit
    effective_from: datetime
    reason: str = Field(min_length=3, max_length=500)

    @field_validator("effective_from")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("effective_from must include a timezone")
        return value.astimezone(timezone.utc)


class ReasonPayload(BaseModel):
    reason: str = Field(min_length=3, max_length=500)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def clean_document(document: dict | None) -> dict | None:
    if document is None:
        return None
    value = dict(document)
    value.pop("_id", None)
    return value


def generated_material_sku(material_id: str, *, legacy: bool = False) -> str:
    normalized = re.sub(r"[^A-Z0-9]", "", material_id.upper())[:12] or "UNKNOWN"
    return f"{'LEGACY-MAT' if legacy else 'MAT'}-{normalized}"


class MaterialService:
    def __init__(self, db):
        self.db = db

    async def _get_material(self, material_id: str) -> dict:
        material = clean_document(
            await self.db.materials.find_one({"id": material_id}, {"_id": 0})
        )
        if not material:
            raise MaterialError(404, "material_not_found", "Bahan baku tidak ditemukan.")
        return material

    async def _ensure_unique_sku(self, sku: str, material_id: str | None = None):
        query = {"sku": sku}
        if material_id is not None:
            query["id"] = {"$ne": material_id}
        if await self.db.materials.find_one(query):
            raise MaterialError(409, "sku_conflict", "SKU bahan baku sudah digunakan.")

    @staticmethod
    def _normalize_state(value: dict, *, material_id: str, legacy: bool) -> dict:
        normalized = dict(value)
        normalized["sku"] = (
            normalized.get("sku", "").strip().upper()
            or generated_material_sku(material_id, legacy=legacy)
        )
        if "status" not in normalized:
            normalized["status"] = "active" if normalized.get("active", True) else "archived"
        normalized["active"] = normalized["status"] == "active"
        normalized.setdefault("setup_status", "needs_review")
        normalized.setdefault("base_unit", None)
        normalized.setdefault("supplier_reference", "")
        normalized.setdefault("waste_percentage", "0")
        normalized.setdefault("reorder_point", "0")
        normalized.setdefault("lead_time_days", 0)
        normalized.setdefault("inventory_tracking_enabled", False)
        if normalized["setup_status"] == "ready" and normalized.get("base_unit") is None:
            raise MaterialError(
                400,
                "material_setup_invalid",
                "Satuan dasar wajib diisi sebelum setup dinyatakan siap.",
            )
        return normalized

    async def list_materials_internal(self) -> list[dict]:
        return await self.db.materials.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

    async def list_materials_public(self) -> list[dict]:
        materials = await self.db.materials.find({"active": True}, {"_id": 0}).sort("name", 1).to_list(500)
        allowed = ("id", "name", "description", "color", "active")
        return [{key: item.get(key) for key in allowed if key in item} for item in materials]

    async def create_material(self, payload: dict, actor: dict) -> dict:
        material_id = str(uuid.uuid4())
        timestamp = now_iso()
        material = self._normalize_state(payload, material_id=material_id, legacy=False)
        material.update(
            {
                "id": material_id,
                "created_at": timestamp,
                "created_by": actor.get("id"),
                "updated_at": timestamp,
                "updated_by": actor.get("id"),
            }
        )
        await self._ensure_unique_sku(material["sku"])
        await self.db.materials.insert_one(material)
        await append_audit_event(
            self.db,
            actor=actor,
            action="material.created",
            target_type="material",
            target_id=material_id,
            after=material,
        )
        return clean_document(material)

    async def update_material(self, material_id: str, payload: dict, actor: dict) -> dict:
        before = await self._get_material(material_id)
        merged = {**before, **payload}
        if "active" in payload and "status" not in payload:
            merged["status"] = "active" if payload["active"] else "archived"
        merged = self._normalize_state(
            merged,
            material_id=material_id,
            legacy=not bool(before.get("sku")),
        )
        await self._ensure_unique_sku(merged["sku"], material_id)
        changes = {
            key: value
            for key, value in merged.items()
            if key not in {"id", "created_at", "created_by", "_id"}
        }
        changes.update({"updated_at": now_iso(), "updated_by": actor.get("id")})
        await self.db.materials.update_one({"id": material_id}, {"$set": changes})
        after = {**before, **changes}
        await append_audit_event(
            self.db,
            actor=actor,
            action="material.updated",
            target_type="material",
            target_id=material_id,
            before=before,
            after=after,
        )
        return after

    async def archive_material(self, material_id: str, actor: dict, reason: str) -> dict:
        before = await self._get_material(material_id)
        changes = {
            "status": "archived",
            "active": False,
            "updated_at": now_iso(),
            "updated_by": actor.get("id"),
        }
        await self.db.materials.update_one({"id": material_id}, {"$set": changes})
        after = {**before, **changes}
        await append_audit_event(
            self.db,
            actor=actor,
            action="material.archived",
            target_type="material",
            target_id=material_id,
            before=before,
            after=after,
            reason=reason,
        )
        return after

    async def list_price_versions(self, material_id: str) -> list[dict]:
        await self._get_material(material_id)
        return await self.db.material_price_versions.find(
            {"material_id": material_id}, {"_id": 0}
        ).sort("effective_from", -1).to_list(500)

    async def create_price_version(self, material_id: str, payload: dict, actor: dict) -> dict:
        material = await self._get_material(material_id)
        if material.get("setup_status") != "ready" or not material.get("base_unit"):
            raise MaterialError(
                409,
                "material_setup_incomplete",
                "Setup bahan baku harus diselesaikan sebelum harga dicatat.",
            )
        if payload["price_unit"] != material["base_unit"]:
            raise MaterialError(
                400,
                "price_unit_mismatch",
                "Satuan harga harus sama dengan satuan dasar bahan baku.",
            )
        if await self.db.material_price_versions.find_one(
            {"material_id": material_id, "effective_from": payload["effective_from"]}
        ):
            raise MaterialError(
                409,
                "effective_date_conflict",
                "Versi harga pada waktu efektif tersebut sudah ada.",
            )
        version = {
            "id": str(uuid.uuid4()),
            "material_id": material_id,
            **payload,
            "created_at": now_iso(),
            "created_by": actor.get("id"),
        }
        await self.db.material_price_versions.insert_one(version)
        await append_audit_event(
            self.db,
            actor=actor,
            action="material.price_version_created",
            target_type="material_price_version",
            target_id=version["id"],
            after=version,
            reason=version["reason"],
        )
        return clean_document(version)

    async def effective_price(self, material_id: str) -> dict:
        versions = await self.list_price_versions(material_id)
        return {
            "current": resolve_effective_price(versions),
            "next_scheduled": resolve_next_scheduled_price(versions),
        }


def build_material_router(*, get_db, require_permission, has_permission) -> APIRouter:
    router = APIRouter(tags=["materials"])

    def serialize_material_for(actor: dict, material: dict) -> dict:
        value = clean_document(material) or {}
        if not has_permission(actor, "supplier_reference.read"):
            value.pop("supplier_reference", None)
        return value

    def reject_supplier_reference_write(actor: dict, fields: set[str]):
        if "supplier_reference" in fields and not has_permission(actor, "supplier_reference.write"):
            raise HTTPException(status_code=403, detail={
                "code": "material_field_forbidden", "field": "supplier_reference",
                "message": "Permission required: supplier_reference.write",
            })

    def service() -> MaterialService:
        return MaterialService(get_db())

    async def invoke(awaitable):
        try:
            return await awaitable
        except MaterialError as exc:
            raise HTTPException(status_code=exc.status_code, detail=exc.payload()) from exc

    @router.get("/materials")
    async def public_materials():
        return await invoke(service().list_materials_public())

    @router.get("/admin/materials")
    async def internal_materials(
        actor: dict = Depends(require_permission("materials.read")),
    ):
        return [serialize_material_for(actor, item) for item in await invoke(service().list_materials_internal())]

    @router.post("/admin/materials")
    async def create_material(
        payload: MaterialPayload,
        actor: dict = Depends(require_permission("materials.write")),
    ):
        reject_supplier_reference_write(actor, payload.model_fields_set)
        value = payload.model_dump(mode="json")
        if "active" in payload.model_fields_set and "status" not in payload.model_fields_set:
            value["status"] = "active" if payload.active else "archived"
        return serialize_material_for(actor, await invoke(service().create_material(value, actor)))

    @router.put("/admin/materials/{material_id}")
    async def update_material(
        material_id: str,
        payload: MaterialUpdatePayload,
        actor: dict = Depends(require_permission("materials.write")),
    ):
        reject_supplier_reference_write(actor, payload.model_fields_set)
        value = payload.model_dump(mode="json", exclude_unset=True)
        if "active" in payload.model_fields_set and "status" not in payload.model_fields_set:
            value["status"] = "active" if payload.active else "archived"
        return serialize_material_for(actor, await invoke(service().update_material(material_id, value, actor)))

    @router.post("/admin/materials/{material_id}/archive")
    async def archive_material(
        material_id: str,
        payload: ReasonPayload,
        actor: dict = Depends(require_permission("materials.archive")),
    ):
        return serialize_material_for(actor, await invoke(service().archive_material(material_id, actor, payload.reason)))

    @router.delete("/admin/materials/{material_id}")
    async def deprecated_archive_material(
        material_id: str,
        response: Response,
        actor: dict = Depends(require_permission("materials.archive")),
    ):
        response.headers["Deprecation"] = "true"
        response.headers["Sunset"] = "Wed, 15 Jul 2026 00:00:00 GMT"
        return serialize_material_for(actor, await invoke(
            service().archive_material(
                material_id,
                actor,
                "Deprecated DELETE compatibility alias",
            )
        ))

    @router.get("/admin/materials/{material_id}/supplier-reference")
    async def get_supplier_reference(
        material_id: str,
        actor: dict = Depends(require_permission("supplier_reference.read")),
    ):
        material = await invoke(service()._get_material(material_id))
        return {"id": material["id"], "supplier_reference": material.get("supplier_reference", "")}

    @router.put("/admin/materials/{material_id}/supplier-reference")
    async def update_supplier_reference(
        material_id: str,
        payload: SupplierReferencePayload,
        actor: dict = Depends(require_permission("supplier_reference.write")),
    ):
        material = await invoke(service().update_material(material_id, payload.model_dump(mode="json", exclude_unset=True), actor))
        return {"id": material["id"], "supplier_reference": material.get("supplier_reference", "")}
    @router.get("/admin/materials/{material_id}/price-versions")
    async def list_price_versions(
        material_id: str,
        _actor: dict = Depends(require_permission("pricing.read")),
    ):
        return await invoke(service().list_price_versions(material_id))

    @router.post(
        "/admin/materials/{material_id}/price-versions",
        status_code=status.HTTP_201_CREATED,
    )
    async def create_price_version(
        material_id: str,
        payload: PriceVersionPayload,
        actor: dict = Depends(require_permission("pricing.write")),
    ):
        return await invoke(
            service().create_price_version(
                material_id,
                payload.model_dump(mode="json"),
                actor,
            )
        )

    @router.get("/admin/materials/{material_id}/effective-price")
    async def effective_price(
        material_id: str,
        _actor: dict = Depends(require_permission("pricing.read")),
    ):
        return await invoke(service().effective_price(material_id))

    return router
