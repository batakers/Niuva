"""Read-only verification for the required migration and index manifest."""

from schema_manifest import INDEX_DECLARATIONS, REQUIRED_SCHEMA_VERSION


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
    migration = await database.schema_migrations.find_one(
        {"_id": REQUIRED_SCHEMA_VERSION},
        {"_id": 1, "applied_at": 1},
    )
    missing_indexes = []
    if migration:
        for declaration in INDEX_DECLARATIONS:
            indexes = await getattr(
                database,
                declaration["collection"],
            ).index_information()
            if not any(_compatible(spec, declaration) for spec in indexes.values()):
                missing_indexes.append(declaration["options"]["name"])
    return {
        "required_version": REQUIRED_SCHEMA_VERSION,
        "applied": bool(migration),
        "indexes_ready": bool(migration) and not missing_indexes,
        "missing_index_count": len(missing_indexes),
        "ready": bool(migration) and not missing_indexes,
    }
