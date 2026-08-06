"""Whole-database snapshot and restore, for the migration backup exercise.

A per-migration rollback undoes what that migration knew it changed. This is
the other half: proof that the database as a whole can be captured before a
migration and put back afterwards, including anything the migration did not
anticipate.

Snapshots use bson.json_util so Decimal128, dates, and ObjectIds survive the
round trip. Writing quantities and money through plain json would turn them
into floats and strings, and a restore that changes a stored decimal is not a
restore.
"""

import argparse
import asyncio
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path

from bson import json_util

SNAPSHOT_FORMAT = 1

# Never captured or restored: system collections belong to the server, not to
# the application's data.
EXCLUDED_PREFIXES = ("system.",)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _canonical(documents: list[dict]) -> str:
    """Stable text for a collection, independent of natural order."""
    encoded = [json_util.dumps(document, sort_keys=True) for document in documents]
    return "\n".join(sorted(encoded))


def collection_digest(documents: list[dict]) -> str:
    return hashlib.sha256(_canonical(documents).encode("utf-8")).hexdigest()


def snapshot_file_digest(path: Path) -> str:
    """Return a custody-safe checksum for the exact snapshot file bytes."""
    digest = hashlib.sha256()
    with path.open("rb") as snapshot_file:
        for chunk in iter(lambda: snapshot_file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


async def collection_names(database) -> list[str]:
    names = await database.list_collection_names()
    return sorted(name for name in names if not name.startswith(EXCLUDED_PREFIXES))


async def capture(database) -> dict:
    """Read every collection into one snapshot document."""
    snapshot = {
        "format": SNAPSHOT_FORMAT,
        "database": database.name,
        "created_at": now_iso(),
        "collections": {},
        "digests": {},
    }
    for name in await collection_names(database):
        documents = await database[name].find({}).to_list(None)
        snapshot["collections"][name] = documents
        # The digest is what makes a later comparison meaningful: counts alone
        # would call a mutated document an intact one.
        snapshot["digests"][name] = collection_digest(documents)
    return snapshot


def write_snapshot(snapshot: dict, path: Path) -> dict:
    if path.exists():
        raise ValueError("snapshot path already exists; refusing to overwrite")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json_util.dumps(snapshot, indent=2), encoding="utf-8")
    return {
        "path": str(path),
        "collections": len(snapshot["collections"]),
        "documents": sum(len(items) for items in snapshot["collections"].values()),
        "checksum": {
            "algorithm": "sha256",
            "value": snapshot_file_digest(path),
        },
    }


def read_snapshot(path: Path) -> dict:
    if not path.exists():
        raise ValueError("snapshot path does not exist")
    snapshot = json_util.loads(path.read_text(encoding="utf-8"))
    if snapshot.get("format") != SNAPSHOT_FORMAT:
        raise ValueError("unsupported snapshot format")
    return snapshot


def verify_snapshot(snapshot: dict) -> dict:
    """Confirm a snapshot still matches the digests it was written with.

    A snapshot nobody checked is a backup nobody has: this is what turns the
    file into evidence that a restore would land the same data.
    """
    mismatched = [
        name
        for name, documents in snapshot["collections"].items()
        if collection_digest(documents) != snapshot["digests"].get(name)
    ]
    return {
        "collections": len(snapshot["collections"]),
        "documents": sum(len(items) for items in snapshot["collections"].values()),
        "mismatched": mismatched,
        "intact": not mismatched,
    }


async def restore(database, snapshot: dict, *, allow_non_empty: bool = False) -> dict:
    """Put a snapshot back, replacing what is there.

    Refuses a populated target unless told explicitly. Restoring over live data
    by accident is the failure this whole exercise exists to prevent.
    """
    existing = await collection_names(database)
    populated = []
    for name in existing:
        if await database[name].count_documents({}):
            populated.append(name)
    if populated and not allow_non_empty:
        raise ValueError(
            f"target database is not empty ({', '.join(populated)}); "
            "pass allow_non_empty to replace it"
        )

    restored = {}
    for name, documents in snapshot["collections"].items():
        await database[name].delete_many({})
        if documents:
            await database[name].insert_many([dict(item) for item in documents])
        restored[name] = len(documents)

    # Collections that appeared after the snapshot are dropped: a restore that
    # leaves later data behind has not returned the database to that point.
    for name in existing:
        if name not in snapshot["collections"]:
            await database[name].drop()

    return {
        "restored": restored,
        "dropped": [name for name in existing if name not in snapshot["collections"]],
    }


async def compare(database, snapshot: dict) -> dict:
    """Compare a live database against a snapshot, per collection."""
    live = await capture(database)
    names = sorted(set(live["collections"]) | set(snapshot["collections"]))
    differences = []
    for name in names:
        before = snapshot["digests"].get(name)
        after = live["digests"].get(name)
        if before != after:
            differences.append(
                {
                    "collection": name,
                    "snapshot_documents": len(snapshot["collections"].get(name, [])),
                    "live_documents": len(live["collections"].get(name, [])),
                }
            )
    return {"identical": not differences, "differences": differences}


async def _database(url: str, name: str):
    from motor.motor_asyncio import AsyncIOMotorClient

    return AsyncIOMotorClient(url), name


async def run_cli(args) -> dict:
    client, name = await _database(args.url, args.database)
    database = client[name]
    try:
        if args.command == "capture":
            snapshot = await capture(database)
            written = write_snapshot(snapshot, Path(args.snapshot))
            return {"command": "capture", **written}
        if args.command == "verify":
            return {
                "command": "verify",
                **verify_snapshot(read_snapshot(Path(args.snapshot))),
            }
        if args.command == "restore":
            snapshot = read_snapshot(Path(args.snapshot))
            check = verify_snapshot(snapshot)
            if not check["intact"]:
                raise ValueError(f"snapshot failed verification: {check['mismatched']}")
            result = await restore(
                database, snapshot, allow_non_empty=args.allow_non_empty
            )
            return {"command": "restore", **result}
        if args.command == "compare":
            return {
                "command": "compare",
                **await compare(database, read_snapshot(Path(args.snapshot))),
            }
        raise ValueError(f"unknown command: {args.command}")
    finally:
        client.close()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Whole-database snapshot and restore for the migration backup "
            "exercise. Capture before a migration, compare after, restore to "
            "prove you can get back."
        )
    )
    parser.add_argument("command", choices=["capture", "verify", "restore", "compare"])
    parser.add_argument("--snapshot", required=True)
    parser.add_argument("--url", default=os.environ.get("MONGO_URL"))
    parser.add_argument("--database", default=os.environ.get("DB_NAME"))
    parser.add_argument(
        "--allow-non-empty",
        action="store_true",
        help="Replace a populated target. Required to restore over live data.",
    )
    return parser


def main() -> None:
    args = build_parser().parse_args()
    if not args.url or not args.database:
        raise SystemExit("--url and --database are required (or MONGO_URL/DB_NAME)")
    print(json.dumps(asyncio.run(run_cli(args)), indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
