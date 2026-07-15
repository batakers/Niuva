INDEX_DECLARATIONS = (
    {
        "collection": "categories",
        "keys": "slug",
        "options": {"name": "uq_category_slug", "unique": True},
    },
    {
        "collection": "products",
        "keys": "slug",
        "options": {"name": "uq_product_slug", "unique": True},
    },
    {
        "collection": "product_variants",
        "keys": "sku",
        "options": {"name": "uq_product_variant_sku", "unique": True},
    },
    {
        "collection": "product_variants",
        "keys": "id",
        "options": {"name": "uq_product_variant_id", "unique": True},
    },
    {
        "collection": "configuration_options",
        "keys": "id",
        "options": {"name": "uq_configuration_option_id", "unique": True},
    },
    {
        "collection": "configuration_options",
        "keys": [("product_id", 1), ("code", 1)],
        "options": {"name": "uq_product_configuration_option_code", "unique": True},
    },
    {
        "collection": "materials",
        "keys": "sku",
        "options": {
            "name": "uq_material_sku",
            "unique": True,
            "partialFilterExpression": {"sku": {"$type": "string"}},
        },
    },
    {
        "collection": "catalog_publications",
        "keys": [("product_id", 1), ("revision", 1)],
        "options": {"name": "uq_catalog_publication_revision", "unique": True},
    },
    {
        "collection": "material_price_versions",
        "keys": [("material_id", 1), ("effective_from", 1)],
        "options": {"name": "uq_material_price_effective_from", "unique": True},
    },
    {
        "collection": "inventory_balances",
        "keys": [("subject_type", 1), ("subject_id", 1)],
        "options": {"name": "uq_inventory_subject", "unique": True},
    },
    {
        "collection": "stock_movements",
        "keys": "operation_id",
        "options": {"name": "uq_stock_movement_operation", "unique": True},
    },
    {
        "collection": "stock_movements",
        "keys": [("subject_type", 1), ("subject_id", 1), ("created_at", -1)],
        "options": {"name": "ix_stock_movement_subject_created"},
    },
    {
        "collection": "inventory_reservations",
        "keys": "id",
        "options": {"name": "uq_inventory_reservation_id", "unique": True},
    },
    {
        "collection": "inventory_reservations",
        "keys": [("reference_type", 1), ("reference_id", 1), ("status", 1)],
        "options": {"name": "ix_inventory_reservation_reference_status"},
    },
    {
        "collection": "restock_alerts",
        "keys": "deduplication_key",
        "options": {
            "name": "uq_active_restock_deduplication",
            "unique": True,
            "partialFilterExpression": {"status": "active"},
        },
    },
)


async def ensure_catalog_inventory_indexes(db) -> list[str]:
    created = []
    for declaration in INDEX_DECLARATIONS:
        collection = getattr(db, declaration["collection"])
        name = await collection.create_index(
            declaration["keys"], **declaration["options"]
        )
        created.append(name)
    return created
