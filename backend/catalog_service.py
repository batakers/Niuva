import base64
import json
import uuid
from copy import deepcopy
from datetime import datetime, timezone

from audit import append_audit_event
from catalog_domain import (
    build_publication_snapshot,
    normalize_slug,
    project_publication_for_public,
    validate_bill_of_materials,
    validate_catalog_aggregate,
)
from pymongo.errors import DuplicateKeyError, PyMongoError


class CatalogError(Exception):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        *,
        errors: list[dict] | None = None,
    ):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.errors = errors

    def payload(self) -> dict:
        value = {"code": self.code, "message": self.message}
        if self.errors is not None:
            value["errors"] = self.errors
        return value


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def _preserved_workflow_status(product: dict) -> str:
    return "archived" if product.get("workflow_status") == "archived" else "draft"


def clean_document(document: dict | None) -> dict | None:
    if document is None:
        return None
    value = dict(document)
    value.pop("_id", None)
    return value


def _write_options(session=None) -> dict:
    return {"session": session} if session is not None else {}


def _is_slug_duplicate(exc: DuplicateKeyError, index_name: str) -> bool:
    details = exc.details or {}
    key_pattern = details.get("keyPattern") or {}
    return set(key_pattern) == {"slug"} or f"index: {index_name}" in str(exc)


class CatalogService:
    def __init__(self, db, client, capabilities, guard):
        self.db = db
        self.client = client
        self.capabilities = capabilities
        self.guard = guard

    async def list_categories(self) -> list[dict]:
        cursor = self.db.categories.find({}, {"_id": 0}).sort("sort_order", 1)
        return await cursor.to_list(500)

    async def get_category(self, category_id: str) -> dict:
        category = clean_document(
            await self.db.categories.find_one({"id": category_id}, {"_id": 0})
        )
        if not category:
            raise CatalogError(404, "category_not_found", "Kategori tidak ditemukan.")
        return category

    async def create_category(self, payload: dict, actor: dict) -> dict:
        slug = normalize_slug(payload.get("slug") or payload["name"])
        if await self.db.categories.find_one({"slug": slug}):
            raise CatalogError(409, "slug_conflict", "Slug kategori sudah digunakan.")
        timestamp = now_iso()
        category = {
            "id": str(uuid.uuid4()),
            **payload,
            "slug": slug,
            "status": payload.get("status", "active"),
            "created_at": timestamp,
            "created_by": actor.get("id"),
            "updated_at": timestamp,
            "updated_by": actor.get("id"),
        }
        async def mutation(session):
            await self.db.categories.insert_one(category, **_write_options(session))
            await append_audit_event(
                self.db,
                actor=actor,
                action="catalog.category_created",
                target_type="category",
                target_id=category["id"],
                after=category,
                session=session,
            )

        try:
            await self.guard.run(
                mutation,
                operation_name="catalog.create_category",
                retry_safe=True,
            )
        except DuplicateKeyError as exc:
            if not _is_slug_duplicate(exc, "uq_category_slug"):
                raise
            raise CatalogError(
                409,
                "slug_conflict",
                "Slug kategori sudah digunakan.",
            ) from exc
        return clean_document(category)

    async def update_category(
        self, category_id: str, payload: dict, actor: dict
    ) -> dict:
        before = await self.get_category(category_id)
        slug = normalize_slug(payload.get("slug") or payload["name"])
        conflict = await self.db.categories.find_one(
            {"slug": slug, "id": {"$ne": category_id}}
        )
        if conflict:
            raise CatalogError(409, "slug_conflict", "Slug kategori sudah digunakan.")
        changes = {
            **payload,
            "slug": slug,
            "updated_at": now_iso(),
            "updated_by": actor.get("id"),
        }
        after = {**before, **changes}

        async def mutation(session):
            result = await self.db.categories.update_one(
                {
                    "id": category_id,
                    "updated_at": before.get("updated_at"),
                },
                {"$set": changes},
                **_write_options(session),
            )
            if not getattr(result, "matched_count", 0):
                raise CatalogError(
                    409,
                    "version_conflict",
                    "Kategori berubah sebelum pembaruan selesai.",
                )
            await append_audit_event(
                self.db,
                actor=actor,
                action="catalog.category_updated",
                target_type="category",
                target_id=category_id,
                before=before,
                after=after,
                session=session,
            )

        await self.guard.run(
            mutation,
            operation_name="catalog.update_category",
            retry_safe=True,
        )
        return after

    async def archive_category(
        self, category_id: str, actor: dict, reason: str
    ) -> dict:
        before = await self.get_category(category_id)
        changes = {
            "status": "archived",
            "updated_at": now_iso(),
            "updated_by": actor.get("id"),
        }
        after = {**before, **changes}

        async def mutation(session):
            result = await self.db.categories.update_one(
                {
                    "id": category_id,
                    "updated_at": before.get("updated_at"),
                },
                {"$set": changes},
                **_write_options(session),
            )
            if not getattr(result, "matched_count", 0):
                raise CatalogError(
                    409,
                    "version_conflict",
                    "Kategori berubah sebelum pengarsipan selesai.",
                )
            await append_audit_event(
                self.db,
                actor=actor,
                action="catalog.category_archived",
                target_type="category",
                target_id=category_id,
                before=before,
                after=after,
                reason=reason,
                session=session,
            )

        await self.guard.run(
            mutation,
            operation_name="catalog.archive_category",
            retry_safe=True,
        )
        return after

    async def list_products(self) -> list[dict]:
        return await self.db.products.find({}, {"_id": 0}).sort(
            "updated_at", -1
        ).to_list(500)

    async def list_quotable_variants(self) -> list[dict]:
        """Active variants a quotation line may reference, across all products.

        Flattened deliberately: a picker built from list_products plus a fetch
        per product would issue one request per product to fill one dropdown.

        Carries only what a quoted line needs to be chosen and understood. The
        snapshot itself is still taken server-side when the revision is
        written, so nothing here is the source of truth for what was quoted.
        """
        variants = await self.db.product_variants.find(
            {"status": "active"}, {"_id": 0}
        ).to_list(1000)
        product_ids = sorted(
            {variant["product_id"] for variant in variants if variant.get("product_id")}
        )
        products = (
            await self.db.products.find(
                {"id": {"$in": product_ids}}, {"_id": 0}
            ).to_list(len(product_ids))
            if product_ids
            else []
        )
        products_by_id = {item["id"]: item for item in products}

        quotable = []
        for variant in variants:
            product = products_by_id.get(variant.get("product_id"))
            if not product:
                continue
            quotable.append(
                {
                    "variant_id": variant["id"],
                    "product_id": product["id"],
                    "product_name": product.get("name", ""),
                    "sku": variant.get("sku", ""),
                    "variant_name": variant.get("name", ""),
                    "option_values": variant.get("option_values") or {},
                    "production_type": variant.get("production_type", ""),
                    "fixed_price": variant.get("fixed_price"),
                    "currency": variant.get("currency", "IDR"),
                    # Whether choosing this line will also freeze a bill of
                    # materials, which is what later lets a work order be
                    # opened against it.
                    "bill_of_materials_lines": len(
                        variant.get("bill_of_materials") or []
                    ),
                }
            )
        return sorted(
            quotable, key=lambda item: (item["product_name"], item["sku"])
        )

    async def _product_document(self, product_id: str) -> dict:
        product = clean_document(
            await self.db.products.find_one({"id": product_id}, {"_id": 0})
        )
        if not product:
            raise CatalogError(404, "product_not_found", "Produk tidak ditemukan.")
        return product

    async def get_product(self, product_id: str) -> dict:
        aggregate = await self._load_aggregate(product_id)
        publications = await self.db.catalog_publications.find(
            {"product_id": product_id}, {"_id": 0}
        ).sort("revision", -1).to_list(500)
        return {**aggregate, "publications": publications}

    async def create_product(self, payload: dict, actor: dict) -> dict:
        await self.get_category(payload["category_id"])
        slug = normalize_slug(payload.get("slug") or payload["name"])
        if await self.db.products.find_one({"slug": slug}):
            raise CatalogError(409, "slug_conflict", "Slug produk sudah digunakan.")
        timestamp = now_iso()
        product = {
            "id": str(uuid.uuid4()),
            **payload,
            "slug": slug,
            "workflow_status": "draft",
            "active_publication_id": None,
            "created_at": timestamp,
            "created_by": actor.get("id"),
            "updated_at": timestamp,
            "updated_by": actor.get("id"),
        }
        async def mutation(session):
            await self.db.products.insert_one(product, **_write_options(session))
            await append_audit_event(
                self.db,
                actor=actor,
                action="catalog.product_created",
                target_type="product",
                target_id=product["id"],
                after=product,
                session=session,
            )

        try:
            await self.guard.run(
                mutation,
                operation_name="catalog.create_product",
                retry_safe=True,
            )
        except DuplicateKeyError as exc:
            if not _is_slug_duplicate(exc, "uq_product_slug"):
                raise
            raise CatalogError(
                409,
                "slug_conflict",
                "Slug produk sudah digunakan.",
            ) from exc
        return clean_document(product)

    async def update_product(
        self, product_id: str, payload: dict, actor: dict
    ) -> dict:
        before = await self._product_document(product_id)
        await self.get_category(payload["category_id"])
        slug = normalize_slug(payload.get("slug") or payload["name"])
        if await self.db.products.find_one(
            {"slug": slug, "id": {"$ne": product_id}}
        ):
            raise CatalogError(409, "slug_conflict", "Slug produk sudah digunakan.")
        changes = {
            **payload,
            "slug": slug,
            "workflow_status": _preserved_workflow_status(before),
            "updated_at": now_iso(),
            "updated_by": actor.get("id"),
        }
        after = {**before, **changes}

        async def mutation(session):
            result = await self.db.products.update_one(
                {
                    "id": product_id,
                    "updated_at": before.get("updated_at"),
                    "workflow_status": before.get("workflow_status"),
                    "active_publication_id": before.get("active_publication_id"),
                },
                {"$set": changes},
                **_write_options(session),
            )
            if not getattr(result, "matched_count", 0):
                raise CatalogError(
                    409,
                    "version_conflict",
                    "Produk berubah sebelum pembaruan selesai.",
                )
            await append_audit_event(
                self.db,
                actor=actor,
                action="catalog.product_updated",
                target_type="product",
                target_id=product_id,
                before=before,
                after=after,
                session=session,
            )

        await self.guard.run(
            mutation,
            operation_name="catalog.update_product",
            retry_safe=True,
        )
        return after

    async def _reject_invalid_bill_of_materials(
        self, prepared: list[tuple[dict | None, dict]]
    ) -> None:
        """Validate every variant BOM before any variant is written."""
        referenced = {
            str(entry.get("material_id", "")).strip()
            for _current, value in prepared
            for entry in value.get("bill_of_materials") or []
            if str(entry.get("material_id", "")).strip()
        }
        materials_by_id = {}
        if referenced:
            documents = await self.db.materials.find(
                {"id": {"$in": sorted(referenced)}}, {"_id": 0}
            ).to_list(len(referenced))
            materials_by_id = {item["id"]: item for item in documents}

        errors: list[dict] = []
        for _current, value in prepared:
            entries = value.get("bill_of_materials") or []
            if not entries:
                continue
            errors.extend(
                {**error, "field": f"variants.{value['sku']}.{error['field']}"}
                for error in validate_bill_of_materials(entries, materials_by_id)
            )

        if errors:
            raise CatalogError(
                422,
                "bom_invalid",
                "Bill of materials varian tidak valid.",
                errors=errors,
            )

    async def replace_variants(
        self, product_id: str, variants: list[dict], actor: dict
    ) -> list[dict]:
        product = await self._product_document(product_id)
        incoming_skus = [item["sku"].strip().upper() for item in variants]
        if len(incoming_skus) != len(set(incoming_skus)):
            raise CatalogError(409, "sku_conflict", "SKU varian harus unik.")
        submitted_ids = [item["id"] for item in variants if item.get("id")]
        if len(submitted_ids) != len(set(submitted_ids)):
            raise CatalogError(
                409,
                "child_identity_conflict",
                "ID varian tidak boleh digunakan lebih dari sekali.",
            )
        existing = await self.db.product_variants.find(
            {"product_id": product_id}, {"_id": 0}
        ).to_list(500)
        existing_by_id = {item["id"]: item for item in existing}
        existing_by_sku = {item["sku"]: item for item in existing}
        timestamp = now_iso()
        prepared = []
        for payload in variants:
            sku = payload["sku"].strip().upper()
            submitted_id = payload.get("id")
            if submitted_id:
                foreign = await self.db.product_variants.find_one(
                    {"id": submitted_id, "product_id": {"$ne": product_id}},
                    {"_id": 0},
                )
                if foreign:
                    raise CatalogError(
                        409,
                        "child_identity_conflict",
                        "ID varian dimiliki produk lain.",
                    )
            current = (
                existing_by_id.get(submitted_id)
                if submitted_id
                else existing_by_sku.get(sku)
            )
            variant_id = submitted_id or (current or {}).get("id") or str(uuid.uuid4())
            conflict = await self.db.product_variants.find_one(
                {"sku": sku, "id": {"$ne": variant_id}}
            )
            if conflict:
                raise CatalogError(409, "sku_conflict", "SKU varian sudah digunakan.")
            value = {
                **(current or {}),
                **payload,
                "id": variant_id,
                "product_id": product_id,
                "sku": sku,
                "updated_at": timestamp,
                "updated_by": actor.get("id"),
            }
            if not current:
                value.setdefault("fixed_price", None)
                value.setdefault("currency", "IDR")
                value.setdefault("status", "active")
                value["created_at"] = timestamp
                value["created_by"] = actor.get("id")
            prepared.append((current, value))

        await self._reject_invalid_bill_of_materials(prepared)

        resolved_ids = [value["id"] for _current, value in prepared]
        if len(resolved_ids) != len(set(resolved_ids)):
            raise CatalogError(
                409,
                "child_identity_conflict",
                "Setiap varian harus memiliki ID yang berbeda.",
            )
        saved = [clean_document(value) for _current, value in prepared]
        saved_ids = {value["id"] for _current, value in prepared}

        async def mutation(session):
            for current, value in prepared:
                if current:
                    await self.db.product_variants.update_one(
                        {"id": value["id"]},
                        {"$set": value},
                        **_write_options(session),
                    )
                else:
                    await self.db.product_variants.insert_one(
                        value, **_write_options(session)
                    )
            for current in existing:
                if current["id"] not in saved_ids and current.get("status") != "archived":
                    await self.db.product_variants.update_one(
                        {"id": current["id"]},
                        {"$set": {
                            "status": "archived",
                            "updated_at": timestamp,
                            "updated_by": actor.get("id"),
                        }},
                        **_write_options(session),
                    )
            await self.db.products.update_one(
                {"id": product_id},
                {"$set": {"workflow_status": _preserved_workflow_status(product), "updated_at": timestamp}},
                **_write_options(session),
            )
            await append_audit_event(
                self.db,
                actor=actor,
                action="catalog.variants_replaced",
                target_type="product",
                target_id=product_id,
                after={"variants": saved},
                session=session,
            )

        await self.guard.run(mutation, operation_name="catalog.replace_variants")
        return saved

    async def replace_options(
        self, product_id: str, options: list[dict], actor: dict
    ) -> list[dict]:
        product = await self._product_document(product_id)
        incoming_codes = [item["code"].strip().lower() for item in options]
        if len(incoming_codes) != len(set(incoming_codes)):
            raise CatalogError(
                409, "option_code_conflict", "Kode opsi harus unik dalam produk."
            )
        submitted_ids = [item["id"] for item in options if item.get("id")]
        if len(submitted_ids) != len(set(submitted_ids)):
            raise CatalogError(
                409,
                "child_identity_conflict",
                "ID opsi tidak boleh digunakan lebih dari sekali.",
            )
        existing = await self.db.configuration_options.find(
            {"product_id": product_id}, {"_id": 0}
        ).to_list(500)
        existing_by_id = {item["id"]: item for item in existing}
        existing_by_code = {item["code"]: item for item in existing}
        timestamp = now_iso()
        prepared = []
        for payload in options:
            code = payload["code"].strip().lower()
            submitted_id = payload.get("id")
            if submitted_id:
                foreign = await self.db.configuration_options.find_one(
                    {"id": submitted_id, "product_id": {"$ne": product_id}},
                    {"_id": 0},
                )
                if foreign:
                    raise CatalogError(
                        409,
                        "child_identity_conflict",
                        "ID opsi dimiliki produk lain.",
                    )
            current = (
                existing_by_id.get(submitted_id)
                if submitted_id
                else existing_by_code.get(code)
            )
            option_id = submitted_id or (current or {}).get("id") or str(uuid.uuid4())
            conflict = await self.db.configuration_options.find_one(
                {"product_id": product_id, "code": code, "id": {"$ne": option_id}}
            )
            if conflict:
                raise CatalogError(
                    409, "option_code_conflict", "Kode opsi sudah digunakan."
                )
            value = {
                **(current or {}),
                **payload,
                "id": option_id,
                "product_id": product_id,
                "code": code,
                "updated_at": timestamp,
                "updated_by": actor.get("id"),
            }
            if not current:
                value["created_at"] = timestamp
                value["created_by"] = actor.get("id")
            prepared.append((current, value))

        resolved_ids = [value["id"] for _current, value in prepared]
        if len(resolved_ids) != len(set(resolved_ids)):
            raise CatalogError(
                409,
                "child_identity_conflict",
                "Setiap opsi harus memiliki ID yang berbeda.",
            )
        saved = [clean_document(value) for _current, value in prepared]
        saved_ids = {value["id"] for _current, value in prepared}

        async def mutation(session):
            for current, value in prepared:
                if current:
                    await self.db.configuration_options.update_one(
                        {"id": value["id"]},
                        {"$set": value},
                        **_write_options(session),
                    )
                else:
                    await self.db.configuration_options.insert_one(
                        value, **_write_options(session)
                    )
            for current in existing:
                if current["id"] not in saved_ids and current.get("active", True):
                    await self.db.configuration_options.update_one(
                        {"id": current["id"]},
                        {"$set": {
                            "active": False,
                            "updated_at": timestamp,
                            "updated_by": actor.get("id"),
                        }},
                        **_write_options(session),
                    )
            await self.db.products.update_one(
                {"id": product_id},
                {"$set": {"workflow_status": _preserved_workflow_status(product), "updated_at": timestamp}},
                **_write_options(session),
            )
            await append_audit_event(
                self.db,
                actor=actor,
                action="catalog.options_replaced",
                target_type="product",
                target_id=product_id,
                after={"options": saved},
                session=session,
            )

        await self.guard.run(mutation, operation_name="catalog.replace_options")
        return saved

    async def _load_aggregate(self, product_id: str) -> dict:
        product = await self._product_document(product_id)
        category = await self.get_category(product["category_id"])
        variants = await self.db.product_variants.find(
            {"product_id": product_id}, {"_id": 0}
        ).to_list(500)
        options = await self.db.configuration_options.find(
            {"product_id": product_id}, {"_id": 0}
        ).to_list(500)
        return {
            "category": category,
            "product": product,
            "variants": variants,
            "options": options,
        }

    async def validate_product(self, product_id: str) -> list[dict]:
        return validate_catalog_aggregate(await self._load_aggregate(product_id))

    async def submit_publication_candidate(
        self,
        product_id: str,
        *,
        actor: dict,
        reason: str,
    ) -> dict:
        aggregate = await self._load_aggregate(product_id)
        errors = validate_catalog_aggregate(aggregate)
        if errors:
            raise CatalogError(
                400,
                "catalog_invalid",
                "Produk belum memenuhi syarat kandidat publikasi.",
                errors=errors,
            )
        product = aggregate["product"]
        if product.get("workflow_status") == "archived":
            raise CatalogError(
                409,
                "catalog_lifecycle_forbidden",
                "Produk yang diarsipkan tidak dapat diajukan untuk publikasi.",
            )
        timestamp = now_iso()
        changes = {
            "workflow_status": "validated",
            "updated_at": timestamp,
            "updated_by": actor.get("id"),
        }
        after = {**product, **changes}

        async def mutation(session):
            result = await self.db.products.update_one(
                {
                    "id": product_id,
                    "updated_at": product.get("updated_at"),
                    "workflow_status": product.get("workflow_status"),
                },
                {"$set": changes},
                **_write_options(session),
            )
            if not getattr(result, "matched_count", 0):
                raise CatalogError(
                    409,
                    "catalog_candidate_conflict",
                    "Produk berubah selama pengajuan kandidat publikasi.",
                )
            await append_audit_event(
                self.db,
                actor=actor,
                action="catalog.product_candidate_submitted",
                target_type="product",
                target_id=product_id,
                before={"workflow_status": product.get("workflow_status")},
                after={"workflow_status": "validated"},
                reason=reason,
                session=session,
            )

        await self.guard.run(
            mutation,
            operation_name="catalog.submit_publication_candidate",
        )
        return after

    async def _next_revision(self, product_id: str, session=None) -> int:
        latest = await self.db.catalog_publications.find(
            {"product_id": product_id},
            {"_id": 0},
            **_write_options(session),
        ).sort("revision", -1).limit(1).to_list(1)
        return (latest[0]["revision"] if latest else 0) + 1

    @staticmethod
    def _publication_conflict(exc: PyMongoError) -> CatalogError | None:
        transient = getattr(exc, "has_error_label", lambda _label: False)(
            "TransientTransactionError"
        )
        if isinstance(exc, DuplicateKeyError) or transient:
            return CatalogError(
                409,
                "catalog_publication_conflict",
                "Publikasi katalog berubah bersamaan; muat ulang sebelum mencoba lagi.",
            )
        return None

    async def publish_product(
        self, product_id: str, actor: dict, reason: str
    ) -> dict:
        aggregate = await self._load_aggregate(product_id)
        errors = validate_catalog_aggregate(aggregate)
        if errors:
            raise CatalogError(
                400,
                "catalog_invalid",
                "Produk belum memenuhi syarat publikasi.",
                errors=errors,
            )
        workflow_status = aggregate["product"].get("workflow_status")
        if workflow_status == "published":
            raise CatalogError(
                409,
                "catalog_publication_conflict",
                "Publikasi katalog berubah bersamaan; muat ulang sebelum mencoba lagi.",
            )
        if workflow_status != "validated":
            raise CatalogError(
                409,
                "catalog_candidate_required",
                "Produk harus diajukan sebagai kandidat publikasi setelah perubahan terakhir.",
            )
        async def mutation(session):
            publication = build_publication_snapshot(
                aggregate,
                revision=await self._next_revision(product_id, session=session),
                actor_id=actor.get("id"),
                reason=reason,
                published_at=now_iso(),
            )
            await self.db.catalog_publications.insert_one(
                publication, **_write_options(session)
            )
            result = await self.db.products.update_one(
                {
                    "id": product_id,
                    "workflow_status": "validated",
                    "updated_at": aggregate["product"].get("updated_at"),
                },
                {
                    "$set": {
                        "active_publication_id": publication["id"],
                        "workflow_status": "published",
                        "updated_at": publication["published_at"],
                    }
                },
                **_write_options(session),
            )
            if not getattr(result, "matched_count", 0):
                raise CatalogError(
                    409,
                    "catalog_candidate_conflict",
                    "Kandidat publikasi berubah sebelum persetujuan selesai.",
                )
            await append_audit_event(
                self.db,
                actor=actor,
                action="catalog.product_published",
                target_type="product",
                target_id=product_id,
                after={"publication_id": publication["id"], "revision": publication["revision"]},
                reason=reason,
                session=session,
            )
            return publication

        try:
            publication = await self.guard.run(
                mutation,
                operation_name="catalog.publish_product",
                retry_safe=True,
            )
        except PyMongoError as exc:
            conflict = self._publication_conflict(exc)
            if conflict is not None:
                raise conflict from exc
            raise
        return clean_document(publication)

    async def rollback_product(
        self,
        product_id: str,
        publication_id: str,
        actor: dict,
        reason: str,
    ) -> dict:
        product = await self._product_document(product_id)
        selected = clean_document(
            await self.db.catalog_publications.find_one(
                {"id": publication_id, "product_id": product_id}, {"_id": 0}
            )
        )
        if not selected:
            raise CatalogError(
                404, "publication_not_found", "Revisi publikasi tidak ditemukan."
            )
        async def mutation(session):
            publication = deepcopy(selected)
            publication.update(
                {
                    "id": str(uuid.uuid4()),
                    "revision": await self._next_revision(
                        product_id, session=session
                    ),
                    "published_at": now_iso(),
                    "published_by": actor.get("id"),
                    "publish_reason": reason,
                    "rollback_source_publication_id": publication_id,
                }
            )
            await self.db.catalog_publications.insert_one(
                publication, **_write_options(session)
            )
            result = await self.db.products.update_one(
                {
                    "id": product_id,
                    "active_publication_id": product.get("active_publication_id"),
                    "updated_at": product.get("updated_at"),
                },
                {
                    "$set": {
                        "active_publication_id": publication["id"],
                        "workflow_status": "published",
                        "updated_at": publication["published_at"],
                    }
                },
                **_write_options(session),
            )
            if not getattr(result, "matched_count", 0):
                raise CatalogError(
                    409,
                    "catalog_publication_conflict",
                    "Publikasi aktif berubah sebelum rollback selesai.",
                )
            await append_audit_event(
                self.db,
                actor=actor,
                action="catalog.product_rolled_back",
                target_type="product",
                target_id=product_id,
                before={"publication_id": publication_id},
                after={"publication_id": publication["id"], "revision": publication["revision"]},
                reason=reason,
                session=session,
            )
            return publication

        try:
            publication = await self.guard.run(
                mutation,
                operation_name="catalog.rollback_product",
                retry_safe=True,
            )
        except PyMongoError as exc:
            conflict = self._publication_conflict(exc)
            if conflict is not None:
                raise conflict from exc
            raise
        return clean_document(publication)

    async def archive_product(
        self, product_id: str, actor: dict, reason: str
    ) -> dict:
        before = await self._product_document(product_id)
        changes = {
            "workflow_status": "archived",
            "active_publication_id": None,
            "updated_at": now_iso(),
            "updated_by": actor.get("id"),
        }
        after = {**before, **changes}

        async def mutation(session):
            result = await self.db.products.update_one(
                {
                    "id": product_id,
                    "updated_at": before.get("updated_at"),
                    "workflow_status": before.get("workflow_status"),
                    "active_publication_id": before.get("active_publication_id"),
                },
                {"$set": changes},
                **_write_options(session),
            )
            if not getattr(result, "matched_count", 0):
                raise CatalogError(
                    409,
                    "version_conflict",
                    "Produk berubah sebelum pengarsipan selesai.",
                )
            await append_audit_event(
                self.db,
                actor=actor,
                action="catalog.product_archived",
                target_type="product",
                target_id=product_id,
                before=before,
                after=after,
                reason=reason,
                session=session,
            )

        await self.guard.run(
            mutation,
            operation_name="catalog.archive_product",
            retry_safe=True,
        )
        return after

    @staticmethod
    def _encode_public_cursor(product: dict) -> str:
        payload = json.dumps(
            {
                "updated_at": product.get("updated_at", ""),
                "id": product["id"],
            },
            separators=(",", ":"),
            sort_keys=True,
        ).encode("utf-8")
        return base64.urlsafe_b64encode(payload).decode("ascii").rstrip("=")

    @staticmethod
    def _decode_public_cursor(cursor: str | None) -> dict | None:
        if not cursor:
            return None
        try:
            padding = "=" * (-len(cursor) % 4)
            value = json.loads(
                base64.urlsafe_b64decode(cursor + padding).decode("utf-8")
            )
            if (
                not isinstance(value, dict)
                or not isinstance(value.get("updated_at"), str)
                or not isinstance(value.get("id"), str)
            ):
                raise ValueError
            return value
        except (ValueError, TypeError, json.JSONDecodeError) as exc:
            raise CatalogError(
                400,
                "cursor_invalid",
                "Cursor katalog tidak valid.",
            ) from exc

    async def _public_projections(
        self,
        publications: list[dict],
    ) -> list[dict]:
        variant_ids = sorted(
            {
                variant["id"]
                for publication in publications
                for variant in publication.get("variants", [])
                if variant.get("id")
            }
        )
        if variant_ids:
            balances = await self.db.inventory_balances.find(
                {
                    "subject_type": "product_variant",
                    "subject_id": {"$in": variant_ids},
                },
                {"_id": 0},
            ).to_list(len(variant_ids))
            working_variants = await self.db.product_variants.find(
                {"id": {"$in": variant_ids}},
                {"_id": 0},
            ).to_list(len(variant_ids))
        else:
            balances = []
            working_variants = []
        balance_by_id = {
            item["subject_id"]: item
            for item in balances
            if item.get("subject_id")
        }
        working_by_id = {
            item["id"]: item
            for item in working_variants
            if item.get("id")
        }
        stock_by_variant = {
            variant_id: {
                "available": balance_by_id.get(variant_id, {}).get(
                    "available",
                    "0",
                ),
                "reorder_point": working_by_id.get(variant_id, {}).get(
                    "reorder_point",
                    "0",
                ),
            }
            for variant_id in variant_ids
        }
        return [
            project_publication_for_public(publication, stock_by_variant)
            for publication in publications
        ]

    async def get_public_product(self, slug: str) -> dict | None:
        product = await self.db.products.find_one(
            {
                "slug": normalize_slug(slug),
                "active_publication_id": {"$ne": None},
            },
            {"_id": 0},
        )
        if not product:
            return None
        publication = clean_document(
            await self.db.catalog_publications.find_one(
                {"id": product["active_publication_id"]}, {"_id": 0}
            )
        )
        if not publication:
            return None
        return (await self._public_projections([publication]))[0]

    async def list_public_products(
        self,
        *,
        limit: int,
        cursor: str | None,
    ) -> dict:
        decoded = self._decode_public_cursor(cursor)
        query = {"active_publication_id": {"$ne": None}}
        if decoded:
            query["$or"] = [
                {"updated_at": {"$lt": decoded["updated_at"]}},
                {
                    "updated_at": decoded["updated_at"],
                    "id": {"$lt": decoded["id"]},
                },
            ]
        products = await self.db.products.find(
            query,
            {
                "_id": 0,
                "id": 1,
                "updated_at": 1,
                "active_publication_id": 1,
            },
        ).sort([("updated_at", -1), ("id", -1)]).limit(limit + 1).to_list(
            limit + 1
        )
        page = products[:limit]
        publication_ids = [
            product["active_publication_id"]
            for product in page
            if product.get("active_publication_id")
        ]
        publications = (
            await self.db.catalog_publications.find(
                {"id": {"$in": publication_ids}},
                {"_id": 0},
            ).to_list(len(publication_ids))
            if publication_ids
            else []
        )
        by_id = {item["id"]: item for item in publications}
        ordered_publications = [
            by_id[product["active_publication_id"]]
            for product in page
            if product.get("active_publication_id") in by_id
        ]
        return {
            "items": await self._public_projections(ordered_publications),
            "next_cursor": (
                self._encode_public_cursor(page[-1])
                if len(products) > limit and page
                else None
            ),
        }

    async def list_public_categories(self) -> list[dict]:
        products = await self.db.products.find(
            {"active_publication_id": {"$ne": None}},
            {"_id": 0, "active_publication_id": 1},
        ).to_list(1000)
        publication_ids = [
            item["active_publication_id"]
            for item in products
            if item.get("active_publication_id")
        ]
        publications = (
            await self.db.catalog_publications.find(
                {"id": {"$in": publication_ids}},
                {"_id": 0, "category": 1},
            ).to_list(len(publication_ids))
            if publication_ids
            else []
        )
        categories = {
            item["category"]["id"]: item["category"]
            for item in publications
            if item.get("category")
        }
        return sorted(categories.values(), key=lambda item: item["name"])
