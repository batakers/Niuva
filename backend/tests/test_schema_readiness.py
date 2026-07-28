import asyncio
from copy import deepcopy

from schema_manifest import (
    READINESS_INDEX_DECLARATIONS,
    REQUIRED_SCHEMA_VERSION,
    REQUIRED_SCHEMA_VERSIONS,
    RETIRED_INDEX_NAMES,
)
from schema_readiness import inspect_schema


def _keys(declaration):
    keys = declaration["keys"]
    return [(keys, 1)] if isinstance(keys, str) else list(keys)


class Collection:
    def __init__(self, rows=()):
        self.rows = [deepcopy(row) for row in rows]
        self.indexes = {"_id_": {"key": [("_id", 1)]}}

    async def find_one(self, query, _projection=None):
        return next(
            (
                deepcopy(row)
                for row in self.rows
                if all(row.get(key) == value for key, value in query.items())
            ),
            None,
        )

    async def index_information(self):
        return deepcopy(self.indexes)


class Database:
    def __init__(self):
        self.collections = {
            "schema_migrations": Collection([{"_id": REQUIRED_SCHEMA_VERSIONS[0]}]),
            "migration_state": Collection(
                [
                    {"_id": version, "migration": version}
                    for version in REQUIRED_SCHEMA_VERSIONS[1:]
                ]
            ),
        }
        for declaration in READINESS_INDEX_DECLARATIONS:
            collection = self._collection(declaration["collection"])
            options = declaration["options"]
            collection.indexes[options["name"]] = {
                "key": _keys(declaration),
                **{
                    key: deepcopy(value)
                    for key, value in options.items()
                    if key != "name"
                },
            }

    def _collection(self, name):
        return self.collections.setdefault(name, Collection())

    def __getattr__(self, name):
        if name.startswith("_"):
            raise AttributeError(name)
        return self._collection(name)


def test_complete_migration_chain_and_indexes_are_ready():
    status = asyncio.run(inspect_schema(Database()))

    assert status == {
        "required_version": REQUIRED_SCHEMA_VERSION,
        "required_versions": list(REQUIRED_SCHEMA_VERSIONS),
        "migrations": {version: True for version in REQUIRED_SCHEMA_VERSIONS},
        "applied": True,
        "indexes_ready": True,
        "missing_index_count": 0,
        "retired_index_count": 0,
        "ready": True,
    }


def test_missing_follow_up_migration_fails_closed():
    database = Database()
    database.migration_state.rows = database.migration_state.rows[:-1]

    status = asyncio.run(inspect_schema(database))

    assert status["migrations"][REQUIRED_SCHEMA_VERSIONS[-1]] is False
    assert status["applied"] is False
    assert status["indexes_ready"] is False
    assert status["ready"] is False


def test_missing_required_index_fails_closed():
    database = Database()
    declaration = READINESS_INDEX_DECLARATIONS[-1]
    database._collection(declaration["collection"]).indexes.pop(
        declaration["options"]["name"]
    )

    status = asyncio.run(inspect_schema(database))

    assert status["missing_index_count"] == 1
    assert status["indexes_ready"] is False
    assert status["ready"] is False


def test_retired_reset_token_index_fails_closed():
    database = Database()
    retired = next(iter(RETIRED_INDEX_NAMES))
    database.password_reset_tokens.indexes[retired] = {"key": [("expires_at", 1)]}

    status = asyncio.run(inspect_schema(database))

    assert status["retired_index_count"] == 1
    assert status["indexes_ready"] is False
    assert status["ready"] is False
