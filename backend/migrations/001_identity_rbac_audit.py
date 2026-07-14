import argparse
import asyncio
import json
import os
from pathlib import Path

ROLE_MAPPING = {
    "admin": ["super_admin"],
    "client": ["retail_customer"],
}


async def migrate(db, *, dry_run: bool) -> dict:
    scanned = 0
    updated = 0

    async for user in db.users.find({"roles": {"$exists": False}}):
        scanned += 1
        roles = ROLE_MAPPING.get(user.get("role"), ["retail_customer"])
        if not dry_run:
            result = await db.users.update_one(
                {"id": user["id"], "roles": {"$exists": False}},
                {
                    "$set": {
                        "roles": roles,
                        "status": user.get("status", "active"),
                    }
                },
            )
            if result.matched_count == 0:
                continue
        updated += 1

    return {"scanned": scanned, "updated": updated, "dry_run": dry_run}


async def ensure_indexes(db) -> dict:
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.users.create_index([("roles", 1), ("status", 1)])
    await db.audit_events.create_index("id", unique=True)
    await db.audit_events.create_index("created_at")
    await db.audit_events.create_index("actor_user_id")
    await db.audit_events.create_index([("target_type", 1), ("target_id", 1)])
    await db.organizations.create_index("id", unique=True)
    await db.organizations.create_index("status")
    await db.organization_memberships.create_index("id", unique=True)
    await db.organization_memberships.create_index(
        [("organization_id", 1), ("user_id", 1)],
        unique=True,
    )
    await db.organization_memberships.create_index([("user_id", 1), ("status", 1)])
    return {"indexes_ensured": 12}


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
        summary = await migrate(database, dry_run=not apply)
        if apply:
            summary.update(await ensure_indexes(database))
        return summary
    finally:
        client.close()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Backfill canonical roles and user status. Dry-run is the default."
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Persist changes. Omit this flag to perform a read-only dry-run.",
    )
    args = parser.parse_args()
    summary = asyncio.run(run_cli(apply=args.apply))
    print(json.dumps(summary, sort_keys=True))


if __name__ == "__main__":
    main()
