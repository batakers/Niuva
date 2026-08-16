"""
Migration 005: Archive orphan collections from removed features.

Targets: internships, organizations, organization_memberships
NOT touched: audit_events, restock_alerts, users

Per AGENTS.md: backup → dry-run → validate → execute with confirmation → rollback instructions.

Workflow:
  1. python -m migrations.005_archive_orphan_collections          # dry-run (default)
  2. python -m migrations.005_archive_orphan_collections --apply  # rename to _archived_*

Rollback:
  db._archived_internships.renameCollection("internships")
  db._archived_organizations.renameCollection("organizations")
  db._archived_organization_memberships.renameCollection("organization_memberships")
"""

import argparse
import asyncio
import json
import os
from pathlib import Path

COLLECTIONS_TO_ARCHIVE = [
    "internships",
    "organizations",
    "organization_memberships",
]


async def migrate(db, *, dry_run: bool) -> dict:
    results = {}
    for name in COLLECTIONS_TO_ARCHIVE:
        existing = await db.list_collection_names(filter={"name": name})
        if not existing:
            results[name] = "not_found"
            continue
        count = await db[name].count_documents({})
        archived_name = f"_archived_{name}"
        if not dry_run:
            # Rename is atomic and non-destructive; data is preserved under new name
            await db[name].rename(archived_name)
        results[name] = {
            "documents": count,
            "archived_as": archived_name,
            "applied": not dry_run,
        }
    return {"collections": results, "dry_run": dry_run}


async def run_cli(*, apply: bool) -> dict:
    from dotenv import load_dotenv
    from motor.motor_asyncio import AsyncIOMotorClient

    backend_dir = Path(__file__).resolve().parents[1]
    load_dotenv(backend_dir / ".env")
    mongo_url = os.environ["MONGO_URL"]
    database_name = os.environ["DB_NAME"]

    client = AsyncIOMotorClient(mongo_url)
    try:
        database = client[database_name]
        return await migrate(database, dry_run=not apply)
    finally:
        client.close()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Archive orphan collections (internships, organizations, organization_memberships). Dry-run is the default."
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Rename collections to _archived_*. Omit for read-only dry-run.",
    )
    args = parser.parse_args()
    summary = asyncio.run(run_cli(apply=args.apply))
    print(json.dumps(summary, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
