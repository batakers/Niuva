from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
RUNBOOK = ROOT / "doc" / "TRANSACTION_CAPABILITY_RUNBOOK.md"


def runbook_text():
    return RUNBOOK.read_text(encoding="utf-8")


def test_runbook_documents_local_ci_readiness_and_troubleshooting():
    text = runbook_text()
    for required in (
        "docker-compose.transaction.yml",
        "docker-compose.transaction-test.yml",
        "MONGO_TRANSACTION_TEST_URL",
        "replicaSet=rs0&directConnection=true",
        "mongodb://mongodb:27017/admin?directConnection=true",
        "replicaSet=rs-test&directConnection=true",
        "mongodb://mongodb-test:27018/admin?directConnection=true",
        "directConnection=true is limited to tracked single-node environments",
        "TRANSACTION_MUTATIONS_ENABLED=false",
        "GET /api/health/live",
        "GET /api/health/ready",
        "transaction_unavailable",
        "transaction_commit_outcome_unknown",
        "transaction_commit_unknown",
        "reconciliation is required",
        "safe_correlation_id",
        "canonical lowercase UUID",
        "correlation_id=None",
        "Authorization headers",
        "request bodies",
        "reset-local-replica-set.ps1 -DestroyData",
        "test_transaction_integration.py",
        "Troubleshooting",
        "Known Limitations",
    ):
        assert required in text


def test_runbook_disclaims_checkout_and_production_authorization():
    text = runbook_text()
    assert "Technical Design Candidate — not approved for implementation" in text
    assert "does not authorize production infrastructure" in text
    assert "does not authorize production go-live" in text
    assert "silent non-atomic fallback is prohibited" in text
