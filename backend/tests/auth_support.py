"""In-memory Mongo subset used by authentication route tests."""

from __future__ import annotations

import types

from pymongo.errors import DuplicateKeyError


class AuthCollection:
    def __init__(self, items=None):
        self.items = [dict(item) for item in (items or [])]

    @classmethod
    def _matches(cls, item, query):
        for key, expected in query.items():
            if key == "$or":
                if not any(cls._matches(item, branch) for branch in expected):
                    return False
                continue
            actual = item.get(key)
            if isinstance(expected, dict):
                if "$gt" in expected and not (
                    actual is not None and actual > expected["$gt"]
                ):
                    return False
                if "$lte" in expected and not (
                    actual is not None and actual <= expected["$lte"]
                ):
                    return False
                if "$exists" in expected and (key in item) != expected["$exists"]:
                    return False
                if "$in" in expected and actual not in expected["$in"]:
                    return False
                continue
            if actual != expected:
                return False
        return True

    @staticmethod
    def _project(item, projection):
        result = dict(item)
        if projection and any(value == 1 for value in projection.values()):
            included = {key for key, value in projection.items() if value == 1}
            result = {key: value for key, value in result.items() if key in included}
        if projection:
            for key, include in projection.items():
                if not include:
                    result.pop(key, None)
        return result

    async def find_one(self, query, projection=None, **_options):
        for item in self.items:
            if self._matches(item, query):
                return self._project(item, projection)
        return None

    async def insert_one(self, item, **_options):
        self.items.append(dict(item))
        return types.SimpleNamespace(inserted_id=item.get("id"))

    @staticmethod
    def _apply_update(item, update):
        item.update(update.get("$setOnInsert", {}))
        item.update(update.get("$set", {}))
        for key, amount in update.get("$inc", {}).items():
            item[key] = item.get(key, 0) + amount

    async def update_one(self, query, update, upsert=False, **_options):
        for item in self.items:
            if self._matches(item, query):
                self._apply_update(item, update)
                return types.SimpleNamespace(
                    matched_count=1,
                    modified_count=1,
                    upserted_id=None,
                )
        if upsert:
            item = {
                key: value
                for key, value in query.items()
                if not isinstance(value, dict)
            }
            self._apply_update(item, update)
            self.items.append(item)
            return types.SimpleNamespace(
                matched_count=0,
                modified_count=0,
                upserted_id=item.get("_id"),
            )
        return types.SimpleNamespace(
            matched_count=0,
            modified_count=0,
            upserted_id=None,
        )

    async def find_one_and_update(
        self,
        query,
        update,
        upsert=False,
        return_document=False,
        **_options,
    ):
        for item in self.items:
            if self._matches(item, query):
                before = dict(item)
                item.update(update.get("$set", {}))
                for key, amount in update.get("$inc", {}).items():
                    item[key] = item.get(key, 0) + amount
                return dict(item) if return_document else before
        if not upsert:
            return None
        item = {
            key: value for key, value in query.items() if not isinstance(value, dict)
        }
        item.update(update.get("$setOnInsert", {}))
        item.update(update.get("$set", {}))
        for key, amount in update.get("$inc", {}).items():
            item[key] = item.get(key, 0) + amount
        if any(existing.get("_id") == item.get("_id") for existing in self.items):
            raise DuplicateKeyError("duplicate _id")
        self.items.append(item)
        return dict(item) if return_document else None

    async def update_many(self, query, update, **_options):
        matched = 0
        for item in self.items:
            if self._matches(item, query):
                self._apply_update(item, update)
                matched += 1
        return types.SimpleNamespace(matched_count=matched, modified_count=matched)

    async def delete_one(self, query, **_options):
        for index, item in enumerate(self.items):
            if self._matches(item, query):
                self.items.pop(index)
                return types.SimpleNamespace(deleted_count=1)
        return types.SimpleNamespace(deleted_count=0)
