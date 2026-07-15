import argparse
import asyncio
import hashlib
import json
import os
import uuid

from catalog_inventory_indexes import INDEX_DECLARATIONS, ensure_catalog_inventory_indexes


REQUIRED_UNIQUE_FIELDS = {
    "uq_product_variant_id",
    "uq_configuration_option_id",
    "uq_product_configuration_option_code",
}


def _index_fields(keys) -> tuple[str, ...]:
    if isinstance(keys, str):
        return (keys,)
    return tuple(key[0] if isinstance(key, (list, tuple)) else key for key in keys)


def _matches_partial_filter(document: dict, expression: dict | None) -> bool:
    for field, expected in (expression or {}).items():
        actual = document.get(field)
        if isinstance(expected, dict) and "$type" in expected:
            if expected["$type"] == "string" and not isinstance(actual, str):
                return False
        elif actual != expected:
            return False
    return True


async def preflight_unique_indexes(db) -> list[dict]:
    failures = []
    for declaration in INDEX_DECLARATIONS:
        options = declaration["options"]
        if not options.get("unique"):
            continue
        name = options["name"]
        fields = _index_fields(declaration["keys"])
        collection = getattr(db, declaration["collection"])
        aggregate = getattr(collection, "aggregate", None)
        if aggregate is not None:
            pipeline = []
            partial_filter = options.get("partialFilterExpression")
            if partial_filter:
                pipeline.append({"$match": partial_filter})
            pipeline.extend(
                [
                    {
                        "$group": {
                            "_id": {field: f"${field}" for field in fields},
                            "count": {"$sum": 1},
                        }
                    },
                    {"$match": {"count": {"$gt": 1}}},
                    {"$count": "duplicate_groups"},
                ]
            )
            duplicate_rows = await aggregate(pipeline).to_list(None)
            duplicate_groups = (
                (duplicate_rows[0] or {}).get("duplicate_groups", 0)
                if duplicate_rows
                else 0
            )
            missing_documents = 0
            if name in REQUIRED_UNIQUE_FIELDS:
                missing_conditions = []
                for field in fields:
                    missing_conditions.extend(
                        [{field: {"$exists": False}}, {field: None}, {field: ""}]
                    )
                missing_rows = await aggregate(
                    [
                        *([{"$match": partial_filter}] if partial_filter else []),
                        {"$match": {"$or": missing_conditions}},
                        {"$count": "missing_documents"},
                    ]
                ).to_list(None)
                missing_documents = (
                    (missing_rows[0] or {}).get("missing_documents", 0)
                    if missing_rows
                    else 0
                )
            if duplicate_groups or missing_documents:
                failures.append(
                    {
                        "index": name,
                        "duplicate_groups": duplicate_groups,
                        "missing_documents": missing_documents,
                    }
                )
            continue
        documents = await getattr(db, declaration["collection"]).find(
            {}, {"_id": 0}
        ).to_list(100000)
        owners = {}
        duplicate_groups = 0
        missing_documents = 0
        for document in documents:
            if not _matches_partial_filter(
                document, options.get("partialFilterExpression")
            ):
                continue
            key = tuple(document.get(field) for field in fields)
            if name in REQUIRED_UNIQUE_FIELDS and any(
                value is None or value == "" for value in key
            ):
                missing_documents += 1
                continue
            owner_count = owners.get(key, 0)
            if owner_count == 1:
                duplicate_groups += 1
            owners[key] = owner_count + 1
        if duplicate_groups or missing_documents:
            failures.append(
                {
                    "index": name,
                    "duplicate_groups": duplicate_groups,
                    "missing_documents": missing_documents,
                }
            )
    return failures


def legacy_material_sku(material_id: str) -> str:
    try:
        prefix = uuid.UUID(str(material_id)).hex[:16]
    except (ValueError, TypeError, AttributeError):
        prefix = hashlib.sha256(str(material_id).encode("utf-8")).hexdigest()[:16]
    return f"LEGACY-MAT-{prefix.upper()}"


def material_changes(material: dict) -> dict:
    return {
        "sku": legacy_material_sku(material["id"]),
        "base_unit": None,
        "supplier_reference": "",
        "waste_percentage": "0",
        "reorder_point": "0",
        "lead_time_days": 0,
        "inventory_tracking_enabled": False,
        "setup_status": "needs_review",
        "status": "active" if material.get("active", True) else "archived",
    }


def is_migrated(material: dict) -> bool:
    return bool(material.get("sku")) and material.get("setup_status") in {
        "needs_review",
        "ready",
    }


async def migrate(db, *, dry_run: bool = True) -> dict:
    materials = await db.materials.find({}, {"_id": 0}).to_list(100000)
    candidates = [material for material in materials if not is_migrated(material)]
    already_migrated = len(materials) - len(candidates)

    sku_owners = {}
    for material in materials:
        if material.get("sku"):
            sku_owners.setdefault(material["sku"].upper(), set()).add(material["id"])
    for material in candidates:
        sku_owners.setdefault(legacy_material_sku(material["id"]), set()).add(
            material["id"]
        )

    affected_ids = sorted(
        material["id"]
        for material in candidates
        if len(sku_owners[legacy_material_sku(material["id"])]) > 1
    )
    index_preflight_failures = await preflight_unique_indexes(db)
    failure_count = len(affected_ids) + len(index_preflight_failures)
    collision_count = len(affected_ids) + sum(
        item["duplicate_groups"] for item in index_preflight_failures
    )
    report = {
        "scanned": len(materials),
        "changed": 0 if failure_count else len(candidates),
        "already_migrated": already_migrated,
        "needs_review": sum(
            1
            for material in materials
            if material.get("setup_status") == "needs_review"
        )
        + len(candidates),
        "collisions": collision_count,
        "failures": failure_count,
        "affected_material_ids": affected_ids,
        "index_preflight_failures": index_preflight_failures,
        "dry_run": dry_run,
    }
    if failure_count or dry_run:
        return report

    for material in candidates:
        await db.materials.update_one(
            {"id": material["id"]},
            {"$set": material_changes(material)},
        )
    await ensure_catalog_inventory_indexes(db)
    return report


async def _run_cli(apply: bool) -> int:
    from dotenv import load_dotenv
    from motor.motor_asyncio import AsyncIOMotorClient

    load_dotenv()
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    try:
        report = await migrate(client[os.environ["DB_NAME"]], dry_run=not apply)
        print(json.dumps(report, indent=2, sort_keys=True))
        return 1 if report["failures"] else 0
    finally:
        client.close()


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Backfill catalog/material/inventory foundation fields."
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Apply writes. Without this flag the migration is dry-run only.",
    )
    args = parser.parse_args()
    return asyncio.run(_run_cli(args.apply))


if __name__ == "__main__":
    raise SystemExit(main())
