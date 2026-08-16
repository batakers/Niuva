"""Provider-neutral worker runtime primitives for Commerce Transaction 1A.

The runtime deliberately keeps delivery consumers and periodic jobs separate.
It provides bounded timing configuration, explicit runtime modes, a
stop-claiming/drain lifecycle, and a fenced lease for named scheduled runs.
"""

from __future__ import annotations

import asyncio
import inspect
import math
import os
import re
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Callable, Mapping

from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

APPROVED_MAX_DELIVERY_OPERATION_SECONDS = 15
APPROVED_ACK_BUDGET_SECONDS = 5
APPROVED_CLOCK_MARGIN_SECONDS = 40
APPROVED_LEASE_SECONDS = 60
APPROVED_RENEWAL_THRESHOLD_SECONDS = 30
APPROVED_MAX_CONCURRENCY = 1
APPROVED_MAX_CLAIM_AHEAD = 0
APPROVED_DRAIN_SECONDS = 30
DEFAULT_POLL_INTERVAL_SECONDS = 5

RUNTIME_MODES = frozenset({"api", "worker", "development", "test"})
CO_LOCATED_MODES = frozenset({"development", "test"})
WORKER_MODES = frozenset({"worker", "development", "test"})
SAFE_JOB_NAME = re.compile(r"^[A-Za-z][A-Za-z0-9_.:-]{0,127}$")
SAFE_OWNER_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9:._-]{0,199}$")


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _numeric(value: object, *, name: str, minimum: float = 0) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{name} must be numeric")
    number = float(value)
    if not math.isfinite(number) or number < minimum:
        raise ValueError(f"{name} must be at least {minimum}")
    return number


@dataclass(frozen=True)
class WorkerRuntimeConfig:
    """Validated bounded worker values.

    The defaults are the approved DR-014 values. Environment configuration is
    validated against those values; test-only alternate timing is available
    only through the explicitly named ``for_testing`` constructor.
    """

    max_delivery_operation_seconds: float = APPROVED_MAX_DELIVERY_OPERATION_SECONDS
    ack_budget_seconds: float = APPROVED_ACK_BUDGET_SECONDS
    clock_margin_seconds: float = APPROVED_CLOCK_MARGIN_SECONDS
    lease_seconds: float = APPROVED_LEASE_SECONDS
    renewal_threshold_seconds: float = APPROVED_RENEWAL_THRESHOLD_SECONDS
    max_concurrency: int = APPROVED_MAX_CONCURRENCY
    max_claim_ahead: int = APPROVED_MAX_CLAIM_AHEAD
    drain_seconds: float = APPROVED_DRAIN_SECONDS
    poll_interval_seconds: float = DEFAULT_POLL_INTERVAL_SECONDS
    enforce_approved_values: bool = field(default=True, repr=False, compare=False)

    def __post_init__(self) -> None:
        for name in (
            "max_delivery_operation_seconds",
            "ack_budget_seconds",
            "clock_margin_seconds",
            "lease_seconds",
            "renewal_threshold_seconds",
            "drain_seconds",
        ):
            _numeric(getattr(self, name), name=name, minimum=0.000001)
        _numeric(
            self.poll_interval_seconds,
            name="poll_interval_seconds",
            minimum=0.000001,
        )
        if (
            isinstance(self.max_concurrency, bool)
            or not isinstance(self.max_concurrency, int)
            or self.max_concurrency != APPROVED_MAX_CONCURRENCY
        ):
            raise ValueError("max_concurrency must be 1")
        if (
            isinstance(self.max_claim_ahead, bool)
            or not isinstance(self.max_claim_ahead, int)
            or self.max_claim_ahead != APPROVED_MAX_CLAIM_AHEAD
        ):
            raise ValueError("max_claim_ahead must be 0")
        required_lease = (
            self.max_delivery_operation_seconds
            + self.ack_budget_seconds
            + self.clock_margin_seconds
        )
        if self.lease_seconds < required_lease:
            raise ValueError(
                "lease_seconds must cover operation, acknowledgement, and clock margin"
            )
        if self.renewal_threshold_seconds > self.lease_seconds:
            raise ValueError("renewal_threshold_seconds cannot exceed lease_seconds")
        if self.enforce_approved_values:
            approved = {
                "max_delivery_operation_seconds": APPROVED_MAX_DELIVERY_OPERATION_SECONDS,
                "ack_budget_seconds": APPROVED_ACK_BUDGET_SECONDS,
                "clock_margin_seconds": APPROVED_CLOCK_MARGIN_SECONDS,
                "lease_seconds": APPROVED_LEASE_SECONDS,
                "renewal_threshold_seconds": APPROVED_RENEWAL_THRESHOLD_SECONDS,
                "drain_seconds": APPROVED_DRAIN_SECONDS,
            }
            for name, expected in approved.items():
                if getattr(self, name) != expected:
                    raise ValueError(f"{name} is outside the approved worker contract")

    @classmethod
    def for_testing(cls, **overrides: object) -> "WorkerRuntimeConfig":
        """Build a deliberately non-production timing configuration for tests."""
        return cls(enforce_approved_values=False, **overrides)

    @classmethod
    def from_environment(
        cls, environ: Mapping[str, str] | None = None
    ) -> "WorkerRuntimeConfig":
        values = environ if environ is not None else os.environ
        names = {
            "max_delivery_operation_seconds": "NIUVA_WORKER_MAX_OPERATION_SECONDS",
            "ack_budget_seconds": "NIUVA_WORKER_ACK_BUDGET_SECONDS",
            "clock_margin_seconds": "NIUVA_WORKER_CLOCK_MARGIN_SECONDS",
            "lease_seconds": "NIUVA_WORKER_LEASE_SECONDS",
            "renewal_threshold_seconds": "NIUVA_WORKER_RENEWAL_THRESHOLD_SECONDS",
            "max_concurrency": "NIUVA_WORKER_MAX_CONCURRENCY",
            "max_claim_ahead": "NIUVA_WORKER_MAX_CLAIM_AHEAD",
            "drain_seconds": "NIUVA_WORKER_DRAIN_SECONDS",
            "poll_interval_seconds": "NIUVA_WORKER_POLL_INTERVAL_SECONDS",
        }
        parsed: dict[str, object] = {}
        for field_name, environment_name in names.items():
            raw = values.get(environment_name)
            if raw is None:
                continue
            try:
                parsed[field_name] = (
                    int(raw)
                    if field_name in {"max_concurrency", "max_claim_ahead"}
                    else float(raw)
                )
            except (TypeError, ValueError) as exc:
                raise ValueError(
                    f"invalid {environment_name} worker configuration"
                ) from exc
        return cls(**parsed)


def resolve_runtime_mode(environ: Mapping[str, str] | None = None) -> str:
    values = environ if environ is not None else os.environ
    mode = str(values.get("NIUVA_RUNTIME_MODE", "api")).strip().lower()
    if mode not in RUNTIME_MODES:
        raise ValueError(f"runtime mode is not supported: {mode or 'empty'}")
    return mode


def is_worker_mode(mode: str) -> bool:
    return mode in WORKER_MODES


def is_co_located_mode(mode: str) -> bool:
    return mode in CO_LOCATED_MODES


async def wait_for_stop(stop_event: asyncio.Event, timeout: float) -> bool:
    """Wait for shutdown or a polling deadline without an unbounded sleep."""
    if stop_event.is_set():
        return True
    try:
        await asyncio.wait_for(stop_event.wait(), timeout=timeout)
    except asyncio.TimeoutError:
        return False
    return True


async def renew_lease_until_stopped(
    *,
    lease,
    stop_event: asyncio.Event,
    interval_seconds: float,
) -> None:
    """Renew a named job lease until the owning job signals completion."""
    interval = _numeric(
        interval_seconds,
        name="lease_renewal_interval_seconds",
        minimum=0.000001,
    )
    while not stop_event.is_set():
        if await wait_for_stop(stop_event, interval):
            return
        try:
            if not await lease.renew():
                return
        except asyncio.CancelledError:
            raise
        except Exception:
            return


async def cancel_task_with_deadline(task: asyncio.Task, timeout: float) -> bool:
    """Request cancellation without waiting past the caller's hard deadline."""
    done, pending = await asyncio.wait({task}, timeout=timeout)
    if not pending:
        return True
    for pending_task in pending:
        pending_task.cancel()
    return False


def _safe_job_result(value: object) -> dict[str, int]:
    if not isinstance(value, dict):
        return {}
    result: dict[str, int] = {}
    for key in ("claimed", "delivered", "failed", "expired", "skipped"):
        candidate = value.get(key)
        if (
            isinstance(candidate, int)
            and not isinstance(candidate, bool)
            and candidate >= 0
        ):
            result[key] = min(candidate, 1_000_000)
    return result


class NamedJobLease:
    """A Mongo-backed fenced lease for one logical periodic job.

    The document id is deterministic, so Mongo's built-in ``_id`` uniqueness
    prevents concurrent upserts from creating two owners without a migration
    or an external scheduler provider.
    """

    def __init__(
        self,
        *,
        collection,
        job_name: str,
        owner_id: str,
        lease_seconds: float = APPROVED_LEASE_SECONDS,
    ):
        if not isinstance(job_name, str) or not SAFE_JOB_NAME.fullmatch(job_name):
            raise ValueError("job_name is not safe")
        if not isinstance(owner_id, str) or not SAFE_OWNER_ID.fullmatch(owner_id):
            raise ValueError("owner_id is not safe")
        validated_lease_seconds = _numeric(
            lease_seconds,
            name="lease_seconds",
            minimum=0.000001,
        )
        if validated_lease_seconds != APPROVED_LEASE_SECONDS:
            raise ValueError("lease_seconds must be 60 seconds")
        self.collection = collection
        self.job_name = job_name
        self.owner_id = owner_id
        self.lease_seconds = validated_lease_seconds
        self.document_id = f"scheduled-job:{job_name}"
        self.fencing_token: str | None = None
        self.run_id: str | None = None

    async def acquire(self, *, at: datetime | None = None) -> dict | None:
        timestamp = at or now_utc()
        token = str(uuid.uuid4())
        run_id = str(uuid.uuid4())
        try:
            entry = await self.collection.find_one_and_update(
                {
                    "_id": self.document_id,
                    "$or": [
                        {"lease_until": None},
                        {"lease_until": {"$lte": timestamp}},
                        {"lease_until": {"$exists": False}},
                    ],
                },
                {
                    "$set": {
                        "job_name": self.job_name,
                        "owner_id": self.owner_id,
                        "run_id": run_id,
                        "fencing_token": token,
                        "status": "active",
                        "scheduled_at": timestamp,
                        "started_at": timestamp,
                        "heartbeat_at": timestamp,
                        "lease_until": timestamp
                        + timedelta(seconds=self.lease_seconds),
                        "updated_at": timestamp,
                    },
                    "$setOnInsert": {
                        "schema_version": 1,
                        "created_at": timestamp,
                    },
                },
                upsert=True,
                projection={"_id": 0},
                return_document=ReturnDocument.AFTER,
            )
        except DuplicateKeyError:
            return None
        if not entry:
            return None
        self.fencing_token = token
        self.run_id = run_id
        return entry

    async def renew(self, *, at: datetime | None = None) -> bool:
        if self.fencing_token is None:
            return False
        timestamp = at or now_utc()
        result = await self.collection.update_one(
            {
                "_id": self.document_id,
                "job_name": self.job_name,
                "owner_id": self.owner_id,
                "fencing_token": self.fencing_token,
                "status": "active",
                "lease_until": {"$gt": timestamp},
            },
            {
                "$set": {
                    "heartbeat_at": timestamp,
                    "lease_until": timestamp + timedelta(seconds=self.lease_seconds),
                    "updated_at": timestamp,
                }
            },
        )
        return bool(getattr(result, "matched_count", 0))

    async def release(
        self,
        *,
        at: datetime | None = None,
        status: str = "released",
        result: dict | None = None,
    ) -> bool:
        if self.fencing_token is None:
            return False
        if status not in {"released", "completed", "failed"}:
            raise ValueError("invalid scheduled job status")
        timestamp = at or now_utc()
        update = {
            "$set": {
                "status": status,
                "finished_at": timestamp,
                "lease_until": timestamp,
                "updated_at": timestamp,
                "result": _safe_job_result(result),
            }
        }
        matched = await self.collection.update_one(
            {
                "_id": self.document_id,
                "job_name": self.job_name,
                "owner_id": self.owner_id,
                "fencing_token": self.fencing_token,
                "status": "active",
                "lease_until": {"$gt": timestamp},
            },
            update,
        )
        success = bool(getattr(matched, "matched_count", 0))
        if success:
            self.fencing_token = None
            self.run_id = None
        return success


class WorkerRuntime:
    """Run one delivery consumer with bounded polling and graceful drain."""

    def __init__(
        self,
        *,
        worker,
        config: WorkerRuntimeConfig | None = None,
        status_sink: Callable[[dict], None] | None = None,
        result_sink: Callable[[dict], object] | None = None,
        heartbeat_interval_seconds: float | None = None,
    ):
        self.worker = worker
        self.config = config or WorkerRuntimeConfig()
        self.status_sink = status_sink
        self.result_sink = result_sink
        self.heartbeat_interval_seconds = (
            self.config.poll_interval_seconds
            if heartbeat_interval_seconds is None
            else _numeric(
                heartbeat_interval_seconds,
                name="heartbeat_interval_seconds",
                minimum=0.000001,
            )
        )
        self.stop_event = asyncio.Event()
        self.status = {
            "enabled": True,
            "running": False,
            "draining": False,
            "last_heartbeat_at": None,
            "last_result": None,
            "last_error_type": None,
        }

    def _publish(self, **changes: object) -> None:
        self.status = {**self.status, **changes}
        if self.status_sink is not None:
            self.status_sink(dict(self.status))

    async def _publish_result(self, result: dict) -> None:
        if self.result_sink is None:
            return
        outcome = self.result_sink(dict(result))
        if inspect.isawaitable(outcome):
            await outcome

    def request_shutdown(self) -> None:
        if self.stop_event.is_set():
            return
        self.worker.stop_claiming()
        self._publish(draining=True)
        self.stop_event.set()

    async def _heartbeat_loop(self) -> None:
        while not self.stop_event.is_set():
            self._publish(last_heartbeat_at=now_utc())
            await wait_for_stop(
                self.stop_event,
                self.heartbeat_interval_seconds,
            )

    async def run(self) -> None:
        self._publish(running=True, last_heartbeat_at=now_utc())
        heartbeat_task = asyncio.create_task(self._heartbeat_loop())
        try:
            while not self.stop_event.is_set():
                try:
                    result = await self.worker.run_once(limit=1)
                    self._publish(last_result=result, last_error_type=None)
                    await self._publish_result(result)
                except asyncio.CancelledError:
                    raise
                except Exception:
                    self._publish(last_error_type="worker_runtime_error")
                if self.stop_event.is_set():
                    break
                await wait_for_stop(
                    self.stop_event,
                    self.config.poll_interval_seconds,
                )
        finally:
            heartbeat_task.cancel()
            await asyncio.gather(heartbeat_task, return_exceptions=True)
            self._publish(running=False)


def build_notification_runtime(
    *,
    service,
    worker_id: str,
    deliverers: dict,
    config: WorkerRuntimeConfig | None = None,
    status_sink: Callable[[dict], None] | None = None,
) -> WorkerRuntime:
    """Construct the supported worker entrypoint without selecting a provider."""
    from notification_worker import NotificationDeliveryWorker

    runtime_config = config or WorkerRuntimeConfig.from_environment()
    worker = NotificationDeliveryWorker(
        service=service,
        worker_id=worker_id,
        deliverers=deliverers,
        runtime_config=runtime_config,
    )
    return WorkerRuntime(
        worker=worker,
        config=runtime_config,
        status_sink=status_sink,
    )


async def run_worker_entrypoint(
    *,
    service,
    worker_id: str,
    deliverers: dict,
    config: WorkerRuntimeConfig | None = None,
    status_sink: Callable[[dict], None] | None = None,
) -> None:
    """Run the separately managed worker entrypoint with injected boundaries.

    Process supervision, deployment, credentials, and provider activation stay
    outside this function. The same reviewed artifact can inject the service
    and explicitly approved deliverers when a worker process is started.
    """
    runtime = build_notification_runtime(
        service=service,
        worker_id=worker_id,
        deliverers=deliverers,
        config=config,
        status_sink=status_sink,
    )
    await runtime.run()
