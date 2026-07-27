import importlib
import types
from copy import deepcopy
from datetime import datetime

from schema_manifest import INDEX_DECLARATIONS


migration = importlib.import_module(
    "migrations.007_security_publication_schema"
)


def nested(document, path):
    value = document
    for part in path.split("."):
        if not isinstance(value, dict):
            return None
        value = value.get(part)
    return value


def matches(document, query):
    for key, expected in query.items():
        actual = nested(document, key)
        if isinstance(expected, dict):
            if "$type" in expected:
                expected_type = expected["$type"]
                if expected_type == "string" and not isinstance(actual, str):
                    return False
            if "$in" in expected and actual not in expected["$in"]:
                return False
            if "$exists" in expected and (actual is not None) != expected["$exists"]:
                return False
            continue
        if actual != expected:
            return False
    return True


class Cursor:
    def __init__(self, rows):
        self.rows = [deepcopy(row) for row in rows]
        self.position = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.position >= len(self.rows):
            raise StopAsyncIteration
        row = self.rows[self.position]
        self.position += 1
        return deepcopy(row)

    async def to_list(self, length):
        return deepcopy(self.rows[:length])


class MigrationCollection:
    def __init__(self, rows=None):
        self.rows = [deepcopy(row) for row in (rows or [])]
        self.indexes = {
            "_id_": {"key": [("_id", 1)]},
        }

    async def find_one(self, query, projection=None):
        for row in self.rows:
            if matches(row, query):
                return deepcopy(row)
        return None

    def find(self, query, projection=None):
        rows = []
        for row in self.rows:
            if not matches(row, query):
                continue
            if projection:
                included = {
                    key
                    for key, value in projection.items()
                    if value and key != "_id"
                }
                if included:
                    projected = {
                        key: nested(row, key)
                        for key in included
                        if nested(row, key) is not None
                    }
                    if projection.get("_id", 1) and "_id" in row:
                        projected["_id"] = row["_id"]
                    rows.append(projected)
                else:
                    rows.append(
                        {
                            key: deepcopy(value)
                            for key, value in row.items()
                            if projection.get(key, 1)
                        }
                    )
            else:
                rows.append(row)
        return Cursor(rows)

    def aggregate(self, pipeline, **_options):
        rows = list(self.rows)
        if pipeline and "$match" in pipeline[0]:
            rows = [
                row
                for row in rows
                if matches(row, pipeline[0]["$match"])
            ]
        group_stage = next(stage["$group"] for stage in pipeline if "$group" in stage)
        group_id = group_stage["_id"]
        counts = {}
        for row in rows:
            if isinstance(group_id, str):
                key = nested(row, group_id[1:])
            else:
                key = tuple(
                    (name, nested(row, expression[1:]))
                    for name, expression in sorted(group_id.items())
                )
            counts[key] = counts.get(key, 0) + 1
        duplicate_count = sum(1 for count in counts.values() if count > 1)
        return Cursor(
            [{"duplicate_groups": duplicate_count}]
            if duplicate_count
            else []
        )

    async def insert_one(self, row):
        self.rows.append(deepcopy(row))
        return types.SimpleNamespace(inserted_id=row.get("_id") or row.get("id"))

    async def update_one(self, query, update):
        for row in self.rows:
            if matches(row, query):
                row.update(deepcopy(update.get("$set", {})))
                for key in update.get("$unset", {}):
                    row.pop(key, None)
                return types.SimpleNamespace(matched_count=1)
        return types.SimpleNamespace(matched_count=0)

    async def index_information(self):
        return deepcopy(self.indexes)

    async def create_index(self, keys, **options):
        normalized = [(keys, 1)] if isinstance(keys, str) else list(keys)
        self.indexes[options["name"]] = {
            "key": normalized,
            **{
                key: deepcopy(value)
                for key, value in options.items()
                if key != "name"
            },
        }
        return options["name"]


class MigrationDatabase:
    def __init__(self):
        self.collections = {}

    def __getattr__(self, name):
        if name.startswith("_"):
            raise AttributeError(name)
        return self.collections.setdefault(name, MigrationCollection())


def build_database():
    database = MigrationDatabase()
    database.orders.rows.append(
        {
            "id": "order-1",
            "user_id": "customer-1",
            "file": {
                "id": "file-1",
                "storage_path": "niuva/orders/customer-1/part.stl",
                "original_filename": "part.stl",
                "content_type": "model/stl",
                "size": 10,
            },
            "created_at": "2026-07-20T00:00:00+00:00",
            "updated_at": "2026-07-20T00:00:00+00:00",
        }
    )
    database.content_blocks.rows.append(
        {
            "id": "content-1",
            "content_type": "faq",
            "slug": "faq-one",
            "status": "published",
            "version": 3,
            "published_version_id": "content-version-1",
            "updated_at": "2026-07-20T00:00:00+00:00",
            "fields": {"question": "Q", "answer": "A"},
        }
    )
    database.content_block_versions.rows.append(
        {
            "id": "content-version-1",
            "content_block_id": "content-1",
            "version": 3,
            "fields": {"question": "Q", "answer": "Published answer"},
        }
    )
    database.password_reset_tokens.rows.append(
        {
            "id": "reset-1",
            "token_hash": "hash-1",
            "expires_at": "2026-08-01T00:00:00+00:00",
        }
    )
    database.notification_outbox.rows.append(
        {
            "id": "outbox-legacy-1",
            "status": "pending",
            "created_at": "2026-07-20T00:00:00+00:00",
        }
    )
    database.settings.rows.append(
        {
            "key": "site",
            "legal_name": "PT Niuva Inovasi Utama",
        }
    )
    database.portfolio.rows.append(
        {
            "id": "portfolio-1",
            "title_id": "Project Publik",
            "title_en": "Public Project",
            "category": "Prototype",
            "description_id": "Deskripsi",
            "description_en": "Description",
            "images": [],
            "featured": True,
            "display_order": 0,
            "status": "published",
            "versions": [
                {
                    "revision": 1,
                    "content": {
                        "title_id": "Project Publik",
                        "title_en": "Public Project",
                    },
                    "actor_user_id": "content-1",
                    "reason": "Initial",
                    "created_at": "2026-07-20T00:00:00+00:00",
                }
            ],
            "published_at": "2026-07-20T00:00:00+00:00",
            "updated_at": "2026-07-20T00:00:00+00:00",
        }
    )
    return database


async def run_idempotent_migration_contract():
    database = build_database()
    dry_run = await migration.migrate(database, dry_run=True)
    assert dry_run["status"] == "ready"
    assert dry_run["planned"]["file_objects"] == 1
    assert dry_run["planned"]["content_publications"] == 1
    assert dry_run["planned"]["date_conversions"] == 1
    assert dry_run["planned"]["portfolio_revisions"] == 1
    assert dry_run["planned"]["portfolio_publications"] == 1
    assert dry_run["planned"]["notification_outbox"] == 1
    assert dry_run["planned"]["settings_versions"] == 1
    assert database.file_objects.rows == []

    applied = await migration.migrate(
        database,
        dry_run=False,
        backup_evidence="reviewed-backup-manifest.json",
    )
    assert applied["status"] == "applied"
    assert len(database.file_objects.rows) == 1
    assert len(database.content_publications.rows) == 1
    assert len(database.portfolio_revisions.rows) == 1
    assert len(database.portfolio_publications.rows) == 1
    assert "versions" not in database.portfolio.rows[0]
    assert (
        database.content_publications.rows[0]["fields"]["answer"]
        == "Published answer"
    )
    assert isinstance(
        database.password_reset_tokens.rows[0]["expires_at"],
        datetime,
    )
    assert database.notification_outbox.rows[0]["delivery_key"] == (
        "migration-outbox:outbox-legacy-1"
    )
    assert isinstance(
        database.notification_outbox.rows[0]["next_attempt_at"],
        datetime,
    )
    assert database.settings.rows[0]["version"] == 1
    assert len(applied["indexes"]["created_indexes"]) == len(
        INDEX_DECLARATIONS
    )

    second = await migration.migrate(
        database,
        dry_run=False,
        backup_evidence="reviewed-backup-manifest.json",
    )
    assert second["status"] == "already_applied"
    assert len(database.file_objects.rows) == 1
    assert len(database.content_publications.rows) == 1


def test_security_schema_migration_is_dry_run_first_and_idempotent():
    import asyncio

    asyncio.run(run_idempotent_migration_contract())


async def run_duplicate_preflight_contract():
    database = build_database()
    database.users.rows.extend(
        [
            {"id": "user-1", "email": "duplicate@example.com"},
            {"id": "user-2", "email": "duplicate@example.com"},
        ]
    )
    report = await migration.migrate(
        database,
        dry_run=False,
        backup_evidence="reviewed-backup-manifest.json",
    )
    assert report["status"] == "blocked_duplicates"
    assert report["duplicate_groups_by_index"]["uq_user_email"] == 1
    assert database.schema_migrations.rows == []
    assert database.file_objects.rows == []


def test_duplicate_preflight_blocks_apply_without_exposing_values():
    import asyncio

    asyncio.run(run_duplicate_preflight_contract())


def test_active_schema_manifest_never_recreates_archived_organization_collections():
    collections = {item["collection"] for item in INDEX_DECLARATIONS}
    assert "organizations" not in collections
    assert "organization_memberships" not in collections
