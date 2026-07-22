from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RUNBOOK = ROOT / "doc" / "TRANSACTION_CAPABILITY_RUNBOOK.md"

IMPLEMENTATION_SUBJECTS = (
    "feat: add mongodb transaction capability detection",
    "fix: harden transaction capability cleanup",
    "feat: add mongodb transaction execution boundary",
    "feat: define transaction unavailable API contract",
    "feat: expose transaction readiness diagnostics",
    "chore: configure local mongodb replica set",
    "ci: run transaction tests against mongodb replica set",
    "fix: harden transaction test topology startup",
    "feat: add fail-closed transaction mutation guard",
    "feat: add safe transaction lifecycle diagnostics",
    "docs: document transaction-capable development setup",
    "style: satisfy transaction quality gates",
    "docs: finalize transaction verification and rollback",
    "fix: emit transaction rejection when mutations disabled",
    "fix: harden local replica set startup",
    "docs: synchronize final verification after post-review fixes",
)


def runbook_text():
    return RUNBOOK.read_text(encoding="utf-8")


def documented_subjects(block):
    return tuple(
        line.strip().rstrip(",").strip('"')
        for line in block.splitlines()
        if line.strip().startswith('"')
    )


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
    candidate_status = "Technical Design Candidate — "
    implementation_status = "not approved for implementation"
    assert candidate_status + implementation_status in text
    assert "does not authorize production infrastructure" in text
    assert "does not authorize production go-live" in text
    assert "silent non-atomic fallback is prohibited" in text


def test_runbook_defines_two_level_rollback_without_fallback():
    text = runbook_text()
    assert "## Final Verification" in text
    assert "## Level 1 — Code Rollback" in text
    assert "## Level 2 — Runtime Mutation Disablement" in text
    assert "9e3bdf6942fac54425aa6cda553dcb5455c5300b" in text
    assert "74b2d7c689db7c033a405b329b5844977795c767" in text
    assert "git fetch origin --prune" not in text
    assert 'TRANSACTION_MUTATIONS_ENABLED="false"' in text
    assert "git revert --no-edit" in text
    assert "fix: harden transaction capability cleanup" in text
    assert "fix: harden transaction test topology startup" in text
    assert "style: satisfy transaction quality gates" in text
    assert "backend/tests/test_inventory_transactions.py" in text
    assert "isWritablePrimary" in text
    assert "does not enable a non-atomic fallback" in text
    assert "do not roll back committed database records" in text
    real_suite = text.index("$realOutput = @(")
    clear_real_url = text.index(
        "Remove-Item Env:MONGO_TRANSACTION_TEST_URL", real_suite
    )
    full_suite_command = "--basetemp C:\\tmp\\niuva-transaction-final"
    full_suite = text.index(full_suite_command, real_suite)
    assert real_suite < clear_real_url < full_suite


def test_runbook_verifies_complete_ordered_local_commit_provenance():
    text = runbook_text()
    verification_start = text.index("## Final Verification")
    verification = text[verification_start:]
    subjects_start = verification.index("$expectedSubjects = @(")
    subjects_end = verification.index("$actualSubjects = @(")
    expected_block = verification[subjects_start:subjects_end]

    assert documented_subjects(expected_block) == IMPLEMENTATION_SUBJECTS
    assert "$actualSubjects.Count -ne $expectedSubjects.Count" in verification
    assert "-eq ($expectedSubjects.Count - 1)" not in verification
    assert "Unexpected implementation commit count: 13" not in verification


def test_runbook_rollback_lists_every_local_commit_newest_first():
    text = runbook_text()
    rollback_start = text.index("## Level 1 — Code Rollback")
    rollback = text[rollback_start:]
    subjects_start = rollback.index("$subjects = @(")
    subjects_end = rollback.index("foreach ($subject in $subjects)")
    rollback_subjects = rollback[subjects_start:subjects_end]

    expected_rollback = tuple(reversed(IMPLEMENTATION_SUBJECTS))
    assert documented_subjects(rollback_subjects) == expected_rollback
