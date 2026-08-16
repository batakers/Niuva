"""Tests for bounded worker runtime and named scheduler ownership."""

import asyncio
import types
from datetime import datetime, timedelta, timezone

import pytest
from pymongo.errors import DuplicateKeyError
from worker_runtime import (
    NamedJobLease,
    WorkerRuntime,
    WorkerRuntimeConfig,
    cancel_task_with_deadline,
    renew_lease_until_stopped,
    resolve_runtime_mode,
)


class LeaseCollection:
    def __init__(self):
        self.items = {}

    @staticmethod
    def _matches(item, query):
        for key, value in query.items():
            if key == "$or":
                if not any(LeaseCollection._matches(item, branch) for branch in value):
                    return False
                continue
            actual = item.get(key)
            if isinstance(value, dict):
                if "$lte" in value and (actual is None or actual > value["$lte"]):
                    return False
                if "$gt" in value and (actual is None or actual <= value["$gt"]):
                    return False
                if "$exists" in value and (key in item) is not value["$exists"]:
                    return False
            elif actual != value:
                return False
        return True

    async def find_one_and_update(
        self,
        query,
        update,
        *,
        upsert=False,
        return_document=None,
        projection=None,
        **_options,
    ):
        target = self.items.get(query.get("_id"))
        if target is None or not self._matches(target, query):
            if not upsert:
                return None
            identifier = query["_id"]
            if identifier in self.items:
                raise DuplicateKeyError("lease already exists")
            target = {"_id": identifier}
            target.update(update.get("$setOnInsert", {}))
            self.items[identifier] = target
        target.update(update.get("$set", {}))
        return dict(target)

    async def update_one(self, query, update, **_options):
        target = self.items.get(query.get("_id"))
        if target is None or not self._matches(target, query):
            return types.SimpleNamespace(matched_count=0, modified_count=0)
        target.update(update.get("$set", {}))
        return types.SimpleNamespace(matched_count=1, modified_count=1)


def test_worker_runtime_config_enforces_the_approved_lease_invariant():
    config = WorkerRuntimeConfig()

    assert config.max_delivery_operation_seconds == 15
    assert config.ack_budget_seconds == 5
    assert config.clock_margin_seconds == 40
    assert config.lease_seconds == 60
    assert config.max_concurrency == 1
    assert config.max_claim_ahead == 0
    assert config.lease_seconds >= (
        config.max_delivery_operation_seconds
        + config.ack_budget_seconds
        + config.clock_margin_seconds
    )

    with pytest.raises(ValueError, match="lease"):
        WorkerRuntimeConfig(lease_seconds=59)


def test_runtime_mode_is_explicit_and_unknown_modes_fail_closed():
    assert resolve_runtime_mode({}) == "api"
    assert resolve_runtime_mode({"NIUVA_RUNTIME_MODE": "worker"}) == "worker"
    assert resolve_runtime_mode({"NIUVA_RUNTIME_MODE": "development"}) == "development"

    with pytest.raises(ValueError, match="runtime mode"):
        resolve_runtime_mode({"NIUVA_RUNTIME_MODE": "production-co-located"})


def test_named_job_lease_has_one_fenced_owner_and_reclaims_after_expiry():
    async def scenario():
        collection = LeaseCollection()
        moment = datetime(2026, 8, 5, tzinfo=timezone.utc)
        first = NamedJobLease(
            collection=collection,
            job_name="reservation_expiry",
            owner_id="worker-a",
            lease_seconds=60,
        )
        second = NamedJobLease(
            collection=collection,
            job_name="reservation_expiry",
            owner_id="worker-b",
            lease_seconds=60,
        )

        acquired = await first.acquire(at=moment)
        assert acquired["owner_id"] == "worker-a"
        assert await second.acquire(at=moment) is None
        assert await second.renew(at=moment + timedelta(seconds=1)) is False
        assert await second.release(at=moment + timedelta(seconds=1)) is False

        reclaimed = await second.acquire(at=moment + timedelta(seconds=61))
        assert reclaimed["owner_id"] == "worker-b"
        assert reclaimed["fencing_token"] != acquired["fencing_token"]
        assert await first.release(at=moment + timedelta(seconds=62)) is False

    asyncio.run(scenario())


def test_named_job_lease_rejects_unapproved_duration():
    with pytest.raises(ValueError, match="60 seconds"):
        NamedJobLease(
            collection=LeaseCollection(),
            job_name="reservation_expiry",
            owner_id="worker-a",
            lease_seconds=59,
        )


def test_worker_runtime_stops_claiming_and_drains_the_active_operation():
    async def scenario():
        started = asyncio.Event()
        release = asyncio.Event()

        class Worker:
            def __init__(self):
                self.stop_calls = 0
                self.calls = 0

            def stop_claiming(self):
                self.stop_calls += 1

            async def run_once(self, *, limit):
                assert limit == 1
                self.calls += 1
                started.set()
                await release.wait()
                return {"claimed": 1, "delivered": 1, "failed": 0}

        worker = Worker()
        runtime = WorkerRuntime(
            worker=worker,
            config=WorkerRuntimeConfig.for_testing(
                drain_seconds=0.2,
                poll_interval_seconds=0.01,
            ),
        )
        task = asyncio.create_task(runtime.run())
        await started.wait()
        runtime.request_shutdown()
        release.set()
        await asyncio.wait_for(task, timeout=1)

        assert worker.stop_calls == 1
        assert worker.calls == 1
        assert runtime.status["running"] is False
        assert runtime.status["draining"] is True

    asyncio.run(scenario())


def test_worker_runtime_reduces_unexpected_errors_to_a_safe_status_code():
    async def scenario():
        class FailingWorker:
            def stop_claiming(self):
                return None

            async def run_once(self, *, limit):
                del limit
                raise RuntimeError("provider-secret-not-for-status")

        runtime = WorkerRuntime(
            worker=FailingWorker(),
            config=WorkerRuntimeConfig.for_testing(poll_interval_seconds=0.001),
        )
        task = asyncio.create_task(runtime.run())
        for _index in range(100):
            if runtime.status["last_error_type"] is not None:
                break
            await asyncio.sleep(0.001)
        runtime.request_shutdown()
        await asyncio.wait_for(task, timeout=1)

        assert runtime.status["last_error_type"] == "worker_runtime_error"
        assert "provider-secret" not in str(runtime.status)

    asyncio.run(scenario())


def test_named_job_lease_renews_until_the_job_stops():
    async def scenario():
        renewed = asyncio.Event()
        stopped = asyncio.Event()

        class Lease:
            async def renew(self):
                renewed.set()
                return True

        task = asyncio.create_task(
            renew_lease_until_stopped(
                lease=Lease(),
                stop_event=stopped,
                interval_seconds=0.001,
            )
        )
        await asyncio.wait_for(renewed.wait(), timeout=1)
        stopped.set()
        await asyncio.wait_for(task, timeout=1)

    asyncio.run(scenario())


def test_cancel_task_with_deadline_does_not_wait_for_cancellation_resistant_task():
    async def scenario():
        release = asyncio.Event()

        async def stubborn():
            try:
                await asyncio.Event().wait()
            except asyncio.CancelledError:
                await release.wait()

        task = asyncio.create_task(stubborn())
        bounded = await cancel_task_with_deadline(task, 0.001)
        assert bounded is False
        assert not task.done()
        release.set()
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)

    asyncio.run(scenario())
