from pathlib import Path


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
