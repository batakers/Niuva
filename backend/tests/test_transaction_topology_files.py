import re
from pathlib import Path
from types import SimpleNamespace

from backend.tests import conftest


ROOT = Path(__file__).resolve().parents[2]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def test_local_replica_set_topology_is_persistent_and_non_destructive():
    compose = read("docker-compose.transaction.yml")
    initializer = read("scripts/mongodb/init-replica-set.js")
    wait_script = read("scripts/mongodb/wait-for-replica-set.ps1")
    reset_script = read("scripts/mongodb/reset-local-replica-set.ps1")
    env_example = read("backend/.env.example")

    assert "mongo:7.0" in compose
    assert "--replSet" in compose and "rs0" in compose
    assert "127.0.0.1:27017:27017" in compose
    assert "mongodb://mongodb:27017/admin?directConnection=true" in compose
    assert "niuva_mongodb_data:/data/db" in compose
    assert "tmpfs" not in compose
    assert "rs.initiate" in initializer
    assert "rs.reconfig" not in initializer
    assert "isWritablePrimary" in initializer
    assert "TimeoutSeconds" in wait_script
    assert "DestroyData" in reset_script
    assert "--volumes" in reset_script
    assert "replicaSet=rs0&directConnection=true" in env_example


def test_local_reset_requires_explicit_destructive_switch():
    reset_script = read("scripts/mongodb/reset-local-replica-set.ps1")
    guard_position = reset_script.index("if (-not $DestroyData)")
    destructive_position = reset_script.index("--volumes")
    assert guard_position < destructive_position
    assert "ShouldProcess" in reset_script


def test_ci_replica_set_is_ephemeral_mandatory_and_isolated():
    compose = read("docker-compose.transaction-test.yml")
    initializer = read("scripts/mongodb/init-test-replica-set.js")
    workflow = read(".github/workflows/transaction-tests.yml")
    fixture = read("backend/tests/conftest.py")
    env_example = read("backend/.env.example")

    assert "mongo:7.0" in compose
    assert "--replSet" in compose and "rs-test" in compose
    assert "127.0.0.1:27018:27018" in compose
    assert "mongodb://mongodb-test:27018/admin?directConnection=true" in compose
    assert "tmpfs" in compose and "/data/db" in compose
    assert "rs.initiate" in initializer
    assert "MONGO_TRANSACTION_TEST_URL" in workflow
    assert "replicaSet=rs-test&directConnection=true" in workflow
    assert "replicaSet=rs-test&directConnection=true" in env_example
    assert "test_transaction_integration.py" in workflow
    assert "test_inventory_transactions.py" in workflow
    assert 'python-version: "3.14.3"' in workflow
    assert "continue-on-error" not in workflow
    assert "PYTEST_XDIST_WORKER" in fixture
    assert "uuid.uuid4" in fixture


def test_transaction_database_names_stay_safe_and_unique(monkeypatch):
    monkeypatch.setenv("PYTEST_XDIST_WORKER", "gw/very-long-worker")
    request = SimpleNamespace(
        node=SimpleNamespace(
            name="test/with/a/very/long/node/name/that/exceeds/mongodb/limits"
        )
    )

    first = conftest.transaction_database_name.__wrapped__(request)
    second = conftest.transaction_database_name.__wrapped__(request)

    assert len(first) <= 63
    assert first.startswith("niuva_tx_gw_very_")
    assert re.fullmatch(r"[a-zA-Z0-9_]+", first)
    assert len(first.rsplit("_", 1)[-1]) == 32
    assert first != second


def test_ci_initializer_waits_for_mongo_with_bounded_retry():
    compose = read("docker-compose.transaction-test.yml")

    assert "for attempt in {1..30}; do" in compose
    assert "db.runCommand({ ping: 1 })" in compose
    assert "sleep 1" in compose
    assert "exit 1" in compose

    retry_position = compose.index("for attempt in {1..30}; do")
    ping_position = compose.index("db.runCommand({ ping: 1 })")
    initializer_position = compose.index(
        "exec mongosh --quiet", ping_position
    )
    failure_position = compose.index("exit 1", initializer_position)
    assert retry_position < ping_position < initializer_position < failure_position


def test_real_inventory_test_uses_shared_isolated_database_fixture():
    inventory_test = read("backend/tests/test_inventory_transactions.py")

    assert "import uuid" not in inventory_test
    assert "async def run_transaction_evidence(database_name):" in inventory_test
    assert "transaction_database_name" in inventory_test
    assert (
        "asyncio.run(run_transaction_evidence(transaction_database_name))"
        in inventory_test
    )
