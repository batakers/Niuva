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

