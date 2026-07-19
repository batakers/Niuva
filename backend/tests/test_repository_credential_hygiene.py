import ast
import unittest
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
INTEGRATION_TEST = REPOSITORY_ROOT / "backend" / "tests" / "backend_test.py"
STALE_ITERATION_REPORT = REPOSITORY_ROOT / "test_reports" / "iteration_1.json"
GITIGNORE = REPOSITORY_ROOT / ".gitignore"


class RepositoryCredentialHygieneTests(unittest.TestCase):
    def test_integration_admin_password_is_not_a_string_literal(self):
        tree = ast.parse(INTEGRATION_TEST.read_text(encoding="utf-8"))
        literal_assignments = [
            node.lineno
            for node in ast.walk(tree)
            if isinstance(node, ast.Assign)
            and any(
                isinstance(target, ast.Name) and target.id == "ADMIN_PASSWORD"
                for target in node.targets
            )
            and isinstance(node.value, ast.Constant)
            and isinstance(node.value.value, str)
        ]

        self.assertEqual(
            literal_assignments,
            [],
            "Integration administrator credentials must come from the test environment.",
        )

    def test_stale_iteration_report_is_not_present(self):
        self.assertFalse(
            STALE_ITERATION_REPORT.exists(),
            "Generated iteration reports must not be tracked in the repository.",
        )

    def test_generated_iteration_reports_are_ignored(self):
        patterns = {
            line.strip()
            for line in GITIGNORE.read_text(encoding="utf-8").splitlines()
            if line.strip() and not line.lstrip().startswith("#")
        }

        self.assertIn("test_reports/iteration_*.json", patterns)


if __name__ == "__main__":
    unittest.main()
