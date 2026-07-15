import argparse
import asyncio
import hashlib
import json
import os
import uuid

from catalog_inventory_indexes import ensure_catalog_inventory_indexes


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
    report = {
        "scanned": len(materials),
        "changed": 0 if affected_ids else len(candidates),
        "already_migrated": already_migrated,
        "needs_review": sum(
            1
            for material in materials
            if material.get("setup_status") == "needs_review"
        )
        + len(candidates),
        "collisions": len(affected_ids),
        "failures": len(affected_ids),
        "affected_material_ids": affected_ids,
        "dry_run": dry_run,
    }
    if affected_ids or dry_run:
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
