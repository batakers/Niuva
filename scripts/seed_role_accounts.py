"""Seed one account per role for browser role-matrix verification.

Verification accounts, not operator accounts. They exist so the role matrix can
sign in as each role and check what it reaches; they are meant for a scratch
database and are removed by --drop when the run is over.

Refuses to touch a database whose name does not mark it as scratch, because
seeding known passwords into a real database is how a verification shortcut
becomes an account someone signs in with later.

Usage:
    python scripts/seed_role_accounts.py --url mongodb://... --database niuva_e2e
    python scripts/seed_role_accounts.py --url mongodb://... --database niuva_e2e --drop
"""

import argparse
import asyncio
import json
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

import bcrypt  # noqa: E402
from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402

# Mirrors the env names the Playwright fixtures read.
ROLE_ACCOUNTS = {
    "super_admin": "E2E_SUPER_ADMIN",
    "sales_estimator": "E2E_SALES",
    "warehouse": "E2E_WAREHOUSE",
    "content_editor": "E2E_CONTENT",
    "production": "E2E_PRODUCTION",
}

# .test, .example, and .invalid are reserved TLDs that the login endpoint
# rejects as invalid addresses, so verification accounts use a real one.
EMAIL_DOMAIN = "e2e.niuva.id"
PASSWORD = "VerifyRoleMatrix123"
SCRATCH_MARKERS = ("_e2e", "_test", "_scratch", "_verify")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def require_scratch(database_name: str) -> None:
    if not any(marker in database_name for marker in SCRATCH_MARKERS):
        raise SystemExit(
            f"refusing to seed '{database_name}': the name must contain one of "
            f"{', '.join(SCRATCH_MARKERS)} so a real database cannot be seeded "
            "with known passwords by accident"
        )


def account_for(role: str) -> dict:
    timestamp = now_iso()
    return {
        "id": str(uuid.uuid4()),
        "name": f"E2E {role}",
        "email": f"e2e-{role.replace('_', '-')}@e2e.niuva.id",
        "phone": "",
        "company": "",
        "password_hash": bcrypt.hashpw(PASSWORD.encode(), bcrypt.gensalt()).decode(),
        "roles": [role],
        "status": "active",
        "access_state": "approved",
        "token_version": 0,
        "version": 1,
        "created_at": timestamp,
        "updated_at": timestamp,
    }


async def seed(database) -> dict:
    created = {}
    for role, env_prefix in ROLE_ACCOUNTS.items():
        account = account_for(role)
        await database.users.delete_many({"email": account["email"]})
        await database.users.insert_one(dict(account))
        created[env_prefix] = {"email": account["email"], "password": PASSWORD}
    return created


async def drop(database) -> dict:
    emails = [
        f"e2e-{role.replace('_', '-')}@e2e.niuva.id" for role in ROLE_ACCOUNTS
    ]
    result = await database.users.delete_many({"email": {"$in": emails}})
    return {"removed": result.deleted_count}


async def run(args) -> dict:
    require_scratch(args.database)
    client = AsyncIOMotorClient(args.url)
    try:
        database = client[args.database]
        if args.drop:
            return {"command": "drop", **await drop(database)}
        return {"command": "seed", "accounts": await seed(database)}
    finally:
        client.close()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", required=True)
    parser.add_argument("--database", required=True)
    parser.add_argument("--drop", action="store_true")
    parser.add_argument(
        "--export",
        action="store_true",
        help="Print shell exports for the Playwright fixtures.",
    )
    args = parser.parse_args()
    result = asyncio.run(run(args))

    if args.export and result.get("accounts"):
        for prefix, account in result["accounts"].items():
            print(f'export {prefix}_EMAIL="{account["email"]}"')
            print(f'export {prefix}_PASSWORD="{account["password"]}"')
        return
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
