"""Read-only verification for the complete required migration/index chain."""

from schema_manifest import (
    READINESS_INDEX_DECLARATIONS,
    REQUIRED_SCHEMA_VERSION,
    REQUIRED_SCHEMA_VERSIONS,
    RETIRED_INDEX_NAMES,
)


def _keys(declaration: dict) -> list[tuple[str, int]]:
    keys = declaration["keys"]
    return [(keys, 1)] if isinstance(keys, str) else list(keys)


def _compatible(spec: dict, declaration: dict) -> bool:
    options = declaration["options"]
    return (
        list(spec.get("key", [])) == _keys(declaration)
        and bool(spec.get("unique", False)) == bool(options.get("unique", False))
        and spec.get("expireAfterSeconds") == options.get("expireAfterSeconds")
        and spec.get("partialFilterExpression")
        == options.get("partialFilterExpression")
    )


async def inspect_schema(database) -> dict:
    migration_status = {}
    for version in REQUIRED_SCHEMA_VERSIONS:
        collection = (
            database.schema_migrations
            if version == REQUIRED_SCHEMA_VERSIONS[0]
            else database.migration_state
        )
        migration_status[version] = bool(
            await collection.find_one(
                {"_id": version},
                {"_id": 1},
            )
        )

    applied = all(migration_status.values())
    missing_indexes = []
    retired_indexes = []
    indexes_by_collection = {}
    if applied:
        for declaration in READINESS_INDEX_DECLARATIONS:
            collection_name = declaration["collection"]
            if collection_name not in indexes_by_collection:
                indexes_by_collection[collection_name] = await getattr(
                    database,
                    collection_name,
                ).index_information()
            indexes = indexes_by_collection[collection_name]
            if not any(_compatible(spec, declaration) for spec in indexes.values()):
                missing_indexes.append(declaration["options"]["name"])
        reset_indexes = indexes_by_collection.get("password_reset_tokens")
        if reset_indexes is None:
            reset_indexes = await database.password_reset_tokens.index_information()
        retired_indexes = sorted(set(reset_indexes) & RETIRED_INDEX_NAMES)

    indexes_ready = applied and not missing_indexes and not retired_indexes
    return {
        "required_version": REQUIRED_SCHEMA_VERSION,
        "required_versions": list(REQUIRED_SCHEMA_VERSIONS),
        "migrations": migration_status,
        "applied": applied,
        "indexes_ready": indexes_ready,
        "missing_index_count": len(missing_indexes),
        "retired_index_count": len(retired_indexes),
        "ready": indexes_ready,
    }
