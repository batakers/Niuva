import uuid
from copy import deepcopy
from datetime import datetime, timezone

from audit import append_audit_event
from catalog_domain import (
    build_publication_snapshot,
    normalize_slug,
    project_publication_for_public,
    validate_catalog_aggregate,
)


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


def clean_document(document: dict | None) -> dict | None:
    if document is None:
        return None
    value = dict(document)
    value.pop("_id", None)
    return value


def _write_options(session=None) -> dict:
    return {"session": session} if session is not None else {}


class CatalogService:
    def __init__(self, db, client, capabilities):
        self.db = db
        self.client = client
        self.capabilities = capabilities

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
        await self.db.categories.insert_one(category)
        await append_audit_event(
            self.db,
            actor=actor,
            action="catalog.category_created",
            target_type="category",
            target_id=category["id"],
            after=category,
        )
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
        await self.db.categories.update_one({"id": category_id}, {"$set": changes})
        after = {**before, **changes}
        await append_audit_event(
            self.db,
            actor=actor,
            action="catalog.category_updated",
            target_type="category",
            target_id=category_id,
            before=before,
            after=after,
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
        await self.db.categories.update_one({"id": category_id}, {"$set": changes})
        after = {**before, **changes}
        await append_audit_event(
            self.db,
            actor=actor,
            action="catalog.category_archived",
            target_type="category",
            target_id=category_id,
            before=before,
            after=after,
            reason=reason,
        )
        return after

    async def list_products(self) -> list[dict]:
        return await self.db.products.find({}, {"_id": 0}).sort(
            "updated_at", -1
        ).to_list(500)

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
        await self.db.products.insert_one(product)
        await append_audit_event(
            self.db,
            actor=actor,
            action="catalog.product_created",
            target_type="product",
            target_id=product["id"],
            after=product,
        )
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
            "workflow_status": "draft",
            "updated_at": now_iso(),
            "updated_by": actor.get("id"),
        }
        await self.db.products.update_one({"id": product_id}, {"$set": changes})
        after = {**before, **changes}
        await append_audit_event(
            self.db,
            actor=actor,
            action="catalog.product_updated",
            target_type="product",
            target_id=product_id,
            before=before,
            after=after,
        )
        return after

    async def replace_variants(
        self, product_id: str, variants: list[dict], actor: dict
    ) -> list[dict]:
        await self._product_document(product_id)
        incoming_skus = [item["sku"].strip().upper() for item in variants]
        if len(incoming_skus) != len(set(incoming_skus)):
            raise CatalogError(409, "sku_conflict", "SKU varian harus unik.")
        existing = await self.db.product_variants.find(
            {"product_id": product_id}, {"_id": 0}
        ).to_list(500)
        existing_by_sku = {item["sku"]: item for item in existing}
        saved = []
        saved_ids = set()
        timestamp = now_iso()
        for payload in variants:
            sku = payload["sku"].strip().upper()
            current = existing_by_sku.get(sku)
            variant_id = payload.get("id") or (current or {}).get("id") or str(uuid.uuid4())
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
            if current:
                await self.db.product_variants.update_one(
                    {"id": variant_id}, {"$set": value}
                )
            else:
                value["created_at"] = timestamp
                value["created_by"] = actor.get("id")
                await self.db.product_variants.insert_one(value)
            saved.append(clean_document(value))
            saved_ids.add(variant_id)
        for current in existing:
            if current["id"] not in saved_ids and current.get("status") != "archived":
                await self.db.product_variants.update_one(
                    {"id": current["id"]},
                    {"$set": {"status": "archived", "updated_at": timestamp}},
                )
        await self.db.products.update_one(
            {"id": product_id},
            {"$set": {"workflow_status": "draft", "updated_at": timestamp}},
        )
        await append_audit_event(
            self.db,
            actor=actor,
            action="catalog.variants_replaced",
            target_type="product",
            target_id=product_id,
            after={"variants": saved},
        )
        return saved

    async def replace_options(
        self, product_id: str, options: list[dict], actor: dict
    ) -> list[dict]:
        await self._product_document(product_id)
        existing = await self.db.configuration_options.find(
            {"product_id": product_id}, {"_id": 0}
        ).to_list(500)
        existing_by_code = {item["code"]: item for item in existing}
        saved = []
        saved_ids = set()
        timestamp = now_iso()
        for payload in options:
            code = payload["code"].strip().lower()
            current = existing_by_code.get(code)
            option_id = payload.get("id") or (current or {}).get("id") or str(uuid.uuid4())
            value = {
                **(current or {}),
                **payload,
                "id": option_id,
                "product_id": product_id,
                "code": code,
                "updated_at": timestamp,
                "updated_by": actor.get("id"),
            }
            if current:
                await self.db.configuration_options.update_one(
                    {"id": option_id}, {"$set": value}
                )
            else:
                value["created_at"] = timestamp
                value["created_by"] = actor.get("id")
                await self.db.configuration_options.insert_one(value)
            saved.append(clean_document(value))
            saved_ids.add(option_id)
        for current in existing:
            if current["id"] not in saved_ids and current.get("active", True):
                await self.db.configuration_options.update_one(
                    {"id": current["id"]},
                    {"$set": {"active": False, "updated_at": timestamp}},
                )
        await self.db.products.update_one(
            {"id": product_id},
            {"$set": {"workflow_status": "draft", "updated_at": timestamp}},
        )
        await append_audit_event(
            self.db,
            actor=actor,
            action="catalog.options_replaced",
            target_type="product",
            target_id=product_id,
            after={"options": saved},
        )
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

    def _require_transactions(self):
        if not self.capabilities.transactions:
            raise CatalogError(
                503,
                "transaction_unavailable",
                "Publikasi aman tidak tersedia karena database belum mendukung transaksi.",
            )

    async def _next_revision(self, product_id: str) -> int:
        latest = await self.db.catalog_publications.find(
            {"product_id": product_id}, {"_id": 0}
        ).sort("revision", -1).limit(1).to_list(1)
        return (latest[0]["revision"] if latest else 0) + 1

    async def publish_product(
        self, product_id: str, actor: dict, reason: str
    ) -> dict:
        self._require_transactions()
        aggregate = await self._load_aggregate(product_id)
        errors = validate_catalog_aggregate(aggregate)
        if errors:
            raise CatalogError(
                400,
                "catalog_invalid",
                "Produk belum memenuhi syarat publikasi.",
                errors=errors,
            )
        publication = build_publication_snapshot(
            aggregate,
            revision=await self._next_revision(product_id),
            actor_id=actor.get("id"),
            reason=reason,
            published_at=now_iso(),
        )
        session = await self.client.start_session()
        async with session:
            async with session.start_transaction():
                await self.db.catalog_publications.insert_one(
                    publication, **_write_options(session)
                )
                await self.db.products.update_one(
                    {"id": product_id},
                    {
                        "$set": {
                            "active_publication_id": publication["id"],
                            "workflow_status": "published",
                            "updated_at": publication["published_at"],
                        }
                    },
                    **_write_options(session),
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
        return clean_document(publication)

    async def rollback_product(
        self,
        product_id: str,
        publication_id: str,
        actor: dict,
        reason: str,
    ) -> dict:
        self._require_transactions()
        await self._product_document(product_id)
        selected = clean_document(
            await self.db.catalog_publications.find_one(
                {"id": publication_id, "product_id": product_id}, {"_id": 0}
            )
        )
        if not selected:
            raise CatalogError(
                404, "publication_not_found", "Revisi publikasi tidak ditemukan."
            )
        publication = deepcopy(selected)
        publication.update(
            {
                "id": str(uuid.uuid4()),
                "revision": await self._next_revision(product_id),
                "published_at": now_iso(),
                "published_by": actor.get("id"),
                "publish_reason": reason,
                "rollback_source_publication_id": publication_id,
            }
        )
        session = await self.client.start_session()
        async with session:
            async with session.start_transaction():
                await self.db.catalog_publications.insert_one(
                    publication, **_write_options(session)
                )
                await self.db.products.update_one(
                    {"id": product_id},
                    {
                        "$set": {
                            "active_publication_id": publication["id"],
                            "workflow_status": "published",
                            "updated_at": publication["published_at"],
                        }
                    },
                    **_write_options(session),
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
        await self.db.products.update_one({"id": product_id}, {"$set": changes})
        after = {**before, **changes}
        await append_audit_event(
            self.db,
            actor=actor,
            action="catalog.product_archived",
            target_type="product",
            target_id=product_id,
            before=before,
            after=after,
            reason=reason,
        )
        return after

    async def _public_projection(self, publication: dict) -> dict:
        stock_by_variant = {}
        for variant in publication.get("variants", []):
            balance = await self.db.inventory_balances.find_one(
                {"subject_type": "product_variant", "subject_id": variant["id"]},
                {"_id": 0},
            )
            working_variant = await self.db.product_variants.find_one(
                {"id": variant["id"]}, {"_id": 0}
            )
            stock_by_variant[variant["id"]] = {
                "available": (balance or {}).get("available", "0"),
                "reorder_point": (working_variant or {}).get("reorder_point", "0"),
            }
        return project_publication_for_public(publication, stock_by_variant)

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
        return await self._public_projection(publication)

    async def list_public_products(self) -> list[dict]:
        products = await self.db.products.find(
            {
                "active_publication_id": {"$ne": None},
            },
            {"_id": 0},
        ).sort("updated_at", -1).to_list(500)
        values = []
        for product in products:
            publication = clean_document(
                await self.db.catalog_publications.find_one(
                    {"id": product["active_publication_id"]}, {"_id": 0}
                )
            )
            if publication:
                values.append(await self._public_projection(publication))
        return values

    async def list_public_categories(self) -> list[dict]:
        products = await self.list_public_products()
        categories = {item["category"]["id"]: item["category"] for item in products}
        return sorted(categories.values(), key=lambda item: item["name"])
