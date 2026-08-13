"""Bounded, read-only dependency probes and secret-safe health projections."""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Awaitable, Callable

from database_capabilities import (
    DatabaseCapabilities,
    TransactionCapabilityReason,
    probe_database_capabilities,
)
from schema_manifest import REQUIRED_SCHEMA_VERSION, REQUIRED_SCHEMA_VERSIONS
from schema_readiness import inspect_schema

PING_TIMEOUT_SECONDS = 0.5
TRANSACTION_TIMEOUT_SECONDS = 1.0
SCHEMA_TIMEOUT_SECONDS = 2.0
TOTAL_TIMEOUT_SECONDS = 3.0
TRANSACTION_MAX_AGE_SECONDS = 10.0
SCHEMA_MAX_AGE_SECONDS = 60.0


@dataclass(frozen=True)
class ReadinessDependencies:
    database_available: bool
    capabilities: DatabaseCapabilities
    schema_status: dict


@dataclass(frozen=True)
class _Snapshot:
    value: object
    refreshed_at: float
    generation: int


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def unavailable_schema_status() -> dict:
    return {
        "required_version": REQUIRED_SCHEMA_VERSION,
        "required_versions": list(REQUIRED_SCHEMA_VERSIONS),
        "migrations": {version: False for version in REQUIRED_SCHEMA_VERSIONS},
        "applied": False,
        "indexes_ready": False,
        "missing_index_count": None,
        "retired_index_count": None,
        "inspection_complete": False,
        "ready": False,
    }


def failed_capabilities(
    clock: Callable[[], datetime] = utc_now,
) -> DatabaseCapabilities:
    checked_at = clock()
    if not isinstance(checked_at, datetime) or checked_at.tzinfo is None:
        checked_at = utc_now()
    return DatabaseCapabilities(
        transactions=False,
        transaction_reason=TransactionCapabilityReason.PROBE_FAILED,
        checked_at=checked_at.astimezone(timezone.utc).isoformat(),
    )


def public_schema_status(value: object) -> dict:
    source = value if isinstance(value, dict) else {}
    migrations = source.get("migrations")
    migrations = migrations if isinstance(migrations, dict) else {}
    normalized_migrations = {
        version: migrations.get(version) is True for version in REQUIRED_SCHEMA_VERSIONS
    }
    missing_index_count = (
        source.get("missing_index_count")
        if type(source.get("missing_index_count")) is int
        and source["missing_index_count"] >= 0
        else None
    )
    retired_index_count = (
        source.get("retired_index_count")
        if type(source.get("retired_index_count")) is int
        and source["retired_index_count"] >= 0
        else None
    )
    inspection_complete = bool(
        missing_index_count is not None and retired_index_count is not None
    )
    applied = source.get("applied") is True and all(normalized_migrations.values())
    indexes_ready = bool(
        source.get("indexes_ready") is True
        and applied
        and inspection_complete
        and missing_index_count == 0
        and retired_index_count == 0
    )
    return {
        "required_version": REQUIRED_SCHEMA_VERSION,
        "required_versions": list(REQUIRED_SCHEMA_VERSIONS),
        "migrations": normalized_migrations,
        "applied": applied,
        "indexes_ready": indexes_ready,
        "missing_index_count": missing_index_count,
        "retired_index_count": retired_index_count,
        "inspection_complete": inspection_complete,
        "ready": bool(source.get("ready") is True and indexes_ready),
    }


def public_transaction_status(capabilities: DatabaseCapabilities) -> dict:
    checked_at = capabilities.checked_at
    try:
        parsed = datetime.fromisoformat(str(checked_at).replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            raise ValueError("checked_at must be timezone-aware")
        checked_at = parsed.astimezone(timezone.utc).isoformat()
    except (TypeError, ValueError):
        checked_at = None
    reason = capabilities.transaction_reason
    if not isinstance(reason, TransactionCapabilityReason):
        reason = TransactionCapabilityReason.PROBE_FAILED
    available = bool(
        capabilities.transactions is True
        and reason is TransactionCapabilityReason.AVAILABLE
        and checked_at is not None
    )
    if (capabilities.transactions is True and not available) or (
        capabilities.transactions is not True
        and reason is TransactionCapabilityReason.AVAILABLE
    ):
        reason = TransactionCapabilityReason.PROBE_FAILED
    return {
        "available": available,
        "reason": reason.value,
        "checked_at": checked_at,
    }


class ReadinessProbeCoordinator:
    """Own bounded probe snapshots; concurrent callers share refresh work."""

    def __init__(
        self,
        client,
        database,
        database_name: str,
        *,
        capability_probe: Callable[..., Awaitable[DatabaseCapabilities]] = (
            probe_database_capabilities
        ),
        schema_probe: Callable[..., Awaitable[dict]] = inspect_schema,
        clock: Callable[[], datetime] = utc_now,
        monotonic: Callable[[], float] = time.monotonic,
        ping_timeout: float = PING_TIMEOUT_SECONDS,
        transaction_timeout: float = TRANSACTION_TIMEOUT_SECONDS,
        schema_timeout: float = SCHEMA_TIMEOUT_SECONDS,
        total_timeout: float = TOTAL_TIMEOUT_SECONDS,
        transaction_max_age: float = TRANSACTION_MAX_AGE_SECONDS,
        schema_max_age: float = SCHEMA_MAX_AGE_SECONDS,
    ):
        self.client = client
        self.database = database
        self.database_name = database_name
        self.capability_probe = capability_probe
        self.schema_probe = schema_probe
        self.clock = clock
        self.monotonic = monotonic
        self.ping_timeout = ping_timeout
        self.transaction_timeout = transaction_timeout
        self.schema_timeout = schema_timeout
        self.total_timeout = total_timeout
        self.transaction_max_age = transaction_max_age
        self.schema_max_age = schema_max_age
        self._generation = 0
        self._transaction_snapshot: _Snapshot | None = None
        self._schema_snapshot: _Snapshot | None = None
        self._transaction_task: asyncio.Task[DatabaseCapabilities] | None = None
        self._schema_task: asyncio.Task[dict] | None = None
        self._dependency_task: asyncio.Task[tuple[DatabaseCapabilities, dict]] | None = None
        self._transaction_lock = asyncio.Lock()
        self._schema_lock = asyncio.Lock()
        self._dependency_lock = asyncio.Lock()

    def _next_generation(self) -> int:
        self._generation += 1
        return self._generation

    def _fresh(self, snapshot: _Snapshot | None, max_age: float) -> bool:
        return bool(
            snapshot is not None
            and 0 <= self.monotonic() - snapshot.refreshed_at <= max_age
        )

    def _publish_transaction(
        self,
        value: DatabaseCapabilities,
        generation: int,
    ) -> DatabaseCapabilities:
        current = self._transaction_snapshot
        if current is None or generation >= current.generation:
            self._transaction_snapshot = _Snapshot(
                value=value,
                refreshed_at=self.monotonic(),
                generation=generation,
            )
        snapshot = self._transaction_snapshot
        assert snapshot is not None
        published = snapshot.value
        return published if isinstance(published, DatabaseCapabilities) else value

    def _publish_schema(self, value: dict, generation: int) -> dict:
        current = self._schema_snapshot
        if current is None or generation >= current.generation:
            self._schema_snapshot = _Snapshot(
                value=value,
                refreshed_at=self.monotonic(),
                generation=generation,
            )
        snapshot = self._schema_snapshot
        assert snapshot is not None
        published = snapshot.value
        return published if isinstance(published, dict) else value

    async def _run_transaction_probe(self) -> DatabaseCapabilities:
        failed = failed_capabilities(self.clock)
        try:
            capabilities = await asyncio.wait_for(
                self.capability_probe(
                    self.client,
                    self.database_name,
                    clock=self.clock,
                ),
                timeout=self.transaction_timeout,
            )
            if not isinstance(capabilities, DatabaseCapabilities):
                return failed
            if public_transaction_status(capabilities)["reason"] == (
                TransactionCapabilityReason.PROBE_FAILED.value
            ):
                return failed
            return capabilities
        except Exception:
            return failed

    async def _run_schema_probe(self) -> dict:
        try:
            value = await asyncio.wait_for(
                self.schema_probe(self.database),
                timeout=self.schema_timeout,
            )
            return public_schema_status(value)
        except Exception:
            return unavailable_schema_status()

    async def _transaction(
        self,
        generation: int,
        *,
        force_refresh: bool = False,
    ) -> DatabaseCapabilities:
        snapshot = self._transaction_snapshot
        if not force_refresh and self._fresh(snapshot, self.transaction_max_age):
            assert snapshot is not None
            value = snapshot.value
            if isinstance(value, DatabaseCapabilities):
                return value
        async with self._transaction_lock:
            task = self._transaction_task
            if task is None or task.done():
                task = asyncio.create_task(self._run_transaction_probe())
                self._transaction_task = task
        assert task is not None
        value = await asyncio.shield(task)
        return self._publish_transaction(value, generation)

    async def _schema(self, generation: int) -> dict:
        snapshot = self._schema_snapshot
        if self._fresh(snapshot, self.schema_max_age):
            assert snapshot is not None
            value = snapshot.value
            if isinstance(value, dict):
                return value
        async with self._schema_lock:
            task = self._schema_task
            if task is None or task.done():
                task = asyncio.create_task(self._run_schema_probe())
                self._schema_task = task
        assert task is not None
        value = await asyncio.shield(task)
        if not isinstance(value, dict):
            value = unavailable_schema_status()
        return self._publish_schema(value, generation)

    async def _run_dependency_probes(
        self,
        generation: int,
        *,
        refresh_transaction: bool,
    ) -> tuple[DatabaseCapabilities, dict]:
        capabilities, schema_status = await asyncio.gather(
            self._transaction(
                generation,
                force_refresh=refresh_transaction,
            ),
            self._schema(generation),
        )
        return capabilities, schema_status

    async def _dependencies(
        self,
        generation: int,
        *,
        refresh_transaction: bool,
    ) -> tuple[DatabaseCapabilities, dict]:
        async with self._dependency_lock:
            task = self._dependency_task
            if task is None or task.done():
                task = asyncio.create_task(
                    self._run_dependency_probes(
                        generation,
                        refresh_transaction=refresh_transaction,
                    )
                )
                self._dependency_task = task
        assert task is not None
        return await asyncio.shield(task)

    async def _probe(
        self,
        generation: int,
        *,
        refresh_transaction: bool,
    ) -> ReadinessDependencies:
        try:
            await asyncio.wait_for(
                self.database.command("ping"),
                timeout=self.ping_timeout,
            )
        except Exception:
            failed = self._publish_transaction(
                failed_capabilities(self.clock),
                generation,
            )
            return ReadinessDependencies(
                False,
                failed,
                unavailable_schema_status(),
            )
        capabilities, schema_status = await self._dependencies(
            generation,
            refresh_transaction=refresh_transaction,
        )
        return ReadinessDependencies(True, capabilities, schema_status)

    async def probe(
        self,
        *,
        refresh_transaction: bool = False,
    ) -> ReadinessDependencies:
        generation = self._next_generation()
        probe_task = asyncio.create_task(
            self._probe(
                generation,
                refresh_transaction=refresh_transaction,
            )
        )
        try:
            await asyncio.sleep(0)
            done, _ = await asyncio.wait(
                {probe_task},
                timeout=self.total_timeout,
            )
            if not done:
                probe_task.cancel()
                await asyncio.gather(probe_task, return_exceptions=True)
                await self._cancel_probe_tasks()
                failed = self._publish_transaction(
                    failed_capabilities(self.clock),
                    generation,
                )
                return ReadinessDependencies(
                    False,
                    failed,
                    unavailable_schema_status(),
                )
            return await probe_task
        except Exception:
            failed = self._publish_transaction(
                failed_capabilities(self.clock),
                generation,
            )
            return ReadinessDependencies(
                False,
                failed,
                unavailable_schema_status(),
            )

    def current_transaction_capabilities(self) -> DatabaseCapabilities:
        snapshot = self._transaction_snapshot
        if not self._fresh(snapshot, self.transaction_max_age):
            return failed_capabilities(self.clock)
        assert snapshot is not None
        value = snapshot.value
        if not isinstance(value, DatabaseCapabilities):
            return failed_capabilities(self.clock)
        return value

    async def close(self) -> None:
        await self._cancel_probe_tasks()

    async def _cancel_probe_tasks(self, *extra_tasks: asyncio.Task) -> None:
        tasks = [
            self._dependency_task,
            self._transaction_task,
            self._schema_task,
            *extra_tasks,
        ]
        for task in tasks:
            if task is not None and not task.done():
                task.cancel()
        await asyncio.gather(
            *(task for task in tasks if task is not None),
            return_exceptions=True,
        )


async def probe_readiness_dependencies(
    client,
    database,
    database_name: str,
    **kwargs,
) -> ReadinessDependencies:
    """Compatibility helper for one fresh bounded dependency probe."""
    coordinator = ReadinessProbeCoordinator(
        client,
        database,
        database_name,
        transaction_max_age=0,
        schema_max_age=0,
        **kwargs,
    )
    try:
        return await coordinator.probe()
    finally:
        await coordinator.close()
