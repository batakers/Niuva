"""Real cross-process rate-limit evidence for SEC-002.

`test_auth_rate_limit.py::test_public_limiter_allows_only_the_atomic_budget_under_concurrency`
already proves the limiter's increment logic is atomic *within one Python
process* (it races `asyncio.gather` calls against a fake collection guarded
by an `asyncio.Lock`). That is not the same claim as "the limit holds when
requests land on different application server workers" — an `asyncio.Lock`
only ever protects against other coroutines in the same process; it says
nothing about two separate `uvicorn` workers racing the same MongoDB
document, which is the actual deployment shape this limiter has to survive.

This file closes that specific gap: each simulated "worker" is a real,
separate OS process (via `multiprocessing`, spawn start method — no shared
Python state, no shared event loop, nothing inherited by fork) that opens
its own Motor client to the same real MongoDB instance and calls
`PublicRateLimiter.consume()` against the *same* rate-limit key. MongoDB's
`find_one_and_update` is the only thing enforcing the limit across them.

Opt in with NIUVA_RUN_REAL_TRANSACTION_TESTS=1 and MONGO_TRANSACTION_TEST_URL,
same convention as every other real-replica test in this suite.

What this proves: the limit holds exactly, across real separate processes,
for the request-accounting path itself.

What this does NOT prove, and does not claim to: trusted-proxy/client-IP
header handling (server.py's client_ip() takes request.client.host as-is —
there is no X-Forwarded-For trust boundary configured, because none can be
until a reverse-proxy topology is decided), alerting/monitoring on
sustained blocking, or named operational ownership. Those remain open.
"""

from __future__ import annotations

import multiprocessing
import os
from urllib.parse import parse_qs, urlparse

import pytest

MONGO_TRANSACTION_TEST_URL = os.environ.get("MONGO_TRANSACTION_TEST_URL")
if (
    os.environ.get("NIUVA_RUN_REAL_TRANSACTION_TESTS") != "1"
    or not MONGO_TRANSACTION_TEST_URL
):
    pytest.skip(
        "Explicit real transaction opt-in and MONGO_TRANSACTION_TEST_URL are required",
        allow_module_level=True,
    )

parsed_test_url = urlparse(MONGO_TRANSACTION_TEST_URL)
if parsed_test_url.hostname not in {"127.0.0.1", "localhost"}:
    raise RuntimeError("multi-worker rate-limit evidence requires a loopback target")

WORKER_COUNT = 4
ATTEMPTS_PER_WORKER = 3
SHARED_LIMIT = 5
WINDOW_SECONDS = 600
SHARED_IDENTIFIER = "multiworker-evidence@example.com"
SHARED_SCOPE = "multiworker_evidence"


def _run_one_worker(mongo_url: str, database_name: str, result_queue) -> None:
    """Entry point for a spawned OS process: its own client, its own loop."""
    import asyncio

    from auth_rate_limit import PublicRateLimiter
    from fastapi import HTTPException
    from motor.motor_asyncio import AsyncIOMotorClient

    async def scenario():
        client = AsyncIOMotorClient(mongo_url)
        try:
            limiter = PublicRateLimiter(
                collection=client[database_name].public_rate_limits,
                secret="multiworker-evidence-secret",
            )
            outcomes = []
            for _attempt in range(ATTEMPTS_PER_WORKER):
                try:
                    await limiter.consume(
                        scope=SHARED_SCOPE,
                        identifier=SHARED_IDENTIFIER,
                        limit=SHARED_LIMIT,
                        window_seconds=WINDOW_SECONDS,
                    )
                    outcomes.append("allowed")
                except HTTPException as exc:
                    outcomes.append(f"blocked:{exc.status_code}")
            return outcomes
        finally:
            client.close()

    result_queue.put(asyncio.run(scenario()))


def test_shared_limit_holds_across_real_separate_worker_processes():
    """Four real OS processes race the same key; MongoDB alone must arbitrate."""
    import asyncio
    import uuid

    from motor.motor_asyncio import AsyncIOMotorClient

    # A fresh, unique database per run: the limiter keys its document by
    # scope+identifier+time-bucket, so a reused database would let a
    # left-over document from a previous run block every attempt here and
    # make the test flaky depending on how recently it last ran.
    database_name = f"niuva_ratelimit_multiworker_evidence_{uuid.uuid4().hex[:12]}"
    context = multiprocessing.get_context("spawn")
    result_queue = context.Queue()
    processes = [
        context.Process(
            target=_run_one_worker,
            args=(MONGO_TRANSACTION_TEST_URL, database_name, result_queue),
        )
        for _ in range(WORKER_COUNT)
    ]

    try:
        for process in processes:
            process.start()
        for process in processes:
            process.join(timeout=30)
            assert process.exitcode == 0, "a worker process failed"

        all_outcomes = []
        for _ in processes:
            all_outcomes.extend(result_queue.get(timeout=5))

        allowed = [outcome for outcome in all_outcomes if outcome == "allowed"]
        blocked = [outcome for outcome in all_outcomes if outcome.startswith("blocked")]

        # The exact accounting claim: WORKER_COUNT * ATTEMPTS_PER_WORKER
        # requests, originating from genuinely separate processes, still
        # produce exactly SHARED_LIMIT successes — not one process's worth,
        # not WORKER_COUNT * SHARED_LIMIT. Only MongoDB's atomic
        # find_one_and_update makes that possible; nothing in this test
        # process itself serializes the four workers.
        assert len(all_outcomes) == WORKER_COUNT * ATTEMPTS_PER_WORKER
        assert len(allowed) == SHARED_LIMIT
        assert len(blocked) == WORKER_COUNT * ATTEMPTS_PER_WORKER - SHARED_LIMIT
        assert all(outcome == "blocked:429" for outcome in blocked)
    finally:
        for process in processes:
            if process.is_alive():
                process.terminate()
            process.join(timeout=5)

        async def cleanup():
            client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
            try:
                await client.drop_database(database_name)
            finally:
                client.close()

        asyncio.run(cleanup())


def test_limiter_does_not_silently_allow_requests_when_mongo_is_unreachable():
    """Documents current outage behavior rather than assuming one.

    This is evidence, not a fix: SEC-002's "outage behavior" gap is about
    knowing what actually happens today, not about this test deciding what
    should happen. A deliberate fail-open/fail-closed policy for abuse
    control during a MongoDB outage is a product/security decision this
    task does not make.
    """
    import asyncio

    from auth_rate_limit import PublicRateLimiter
    from motor.motor_asyncio import AsyncIOMotorClient
    from pymongo.errors import PyMongoError

    async def scenario():
        # An address with no listener and a short timeout, so the test
        # fails fast instead of hanging on the default 30s selection window.
        client = AsyncIOMotorClient(
            "mongodb://127.0.0.1:1/",
            serverSelectionTimeoutMS=500,
        )
        try:
            limiter = PublicRateLimiter(
                collection=client["niuva_unreachable_probe"].public_rate_limits,
                secret="outage-probe-secret",
            )
            with pytest.raises(PyMongoError):
                await limiter.consume(
                    scope="outage_probe",
                    identifier="probe@example.com",
                    limit=5,
                    window_seconds=60,
                )
        finally:
            client.close()

    asyncio.run(scenario())
