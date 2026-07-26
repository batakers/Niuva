from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8")


def test_admin_studio_quality_workflow_runs_backend_frontend_and_build_gates():
    workflow = read(".github/workflows/quality-gates.yml")

    assert "python -m pytest -q backend/tests" in workflow
    assert "npm test -- --watchAll=false --runInBand" in workflow
    assert "npm run build" in workflow
    assert "npm ci" in workflow


def test_transaction_workflow_covers_identity_and_inventory_atomicity():
    workflow = read(".github/workflows/transaction-tests.yml")

    assert "backend/tests/test_transaction_integration.py" in workflow
    assert "backend/tests/test_inventory_transactions.py" in workflow
    assert "backend/tests/test_identity_access_migration.py" in workflow
    assert "backend/tests/test_granular_role_migration.py" in workflow
    assert "NIUVA_RUN_REAL_TRANSACTION_TESTS: \"1\"" in workflow

    for test_file in (
        "backend/tests/test_transaction_integration.py",
        "backend/tests/test_inventory_transactions.py",
        "backend/tests/test_identity_access_migration.py",
        "backend/tests/test_granular_role_migration.py",
    ):
        assert "NIUVA_RUN_REAL_TRANSACTION_TESTS" in read(test_file)
