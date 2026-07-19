import ast
import unittest
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
INTEGRATION_TEST = REPOSITORY_ROOT / "backend" / "tests" / "backend_test.py"
STALE_ITERATION_REPORT = REPOSITORY_ROOT / "test_reports" / "iteration_1.json"
GITIGNORE = REPOSITORY_ROOT / ".gitignore"


class RepositoryCredentialHygieneTests(unittest.TestCase):
    def test_integration_admin_credentials_use_required_environment_contract(self):
        tree = ast.parse(INTEGRATION_TEST.read_text(encoding="utf-8"))
        expected_environment = {
            "ADMIN_EMAIL": "NIUVA_TEST_ADMIN_EMAIL",
            "ADMIN_PASSWORD": "NIUVA_TEST_ADMIN_PASSWORD",
        }
        assignments = {name: [] for name in expected_environment}

        for node in ast.walk(tree):
            if not isinstance(node, ast.Assign):
                continue
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id in assignments:
                    assignments[target.id].append(node.value)

        for credential_name, environment_name in expected_environment.items():
            self.assertEqual(
                len(assignments[credential_name]),
                1,
                f"{credential_name} must have exactly one repository-level assignment.",
            )
            value = assignments[credential_name][0]

            if credential_name == "ADMIN_EMAIL":
                self.assertIsInstance(value, ast.Call)
                self.assertIsInstance(value.func, ast.Attribute)
                self.assertEqual(value.func.attr, "strip")
                self.assertEqual(value.args, [])
                self.assertEqual(value.keywords, [])
                value = value.func.value

            self.assertIsInstance(value, ast.Call)
            self.assertIsInstance(value.func, ast.Attribute)
            self.assertEqual(value.func.attr, "get")
            self.assertIsInstance(value.func.value, ast.Attribute)
            self.assertEqual(value.func.value.attr, "environ")
            self.assertIsInstance(value.func.value.value, ast.Name)
            self.assertEqual(value.func.value.value.id, "os")
            self.assertEqual(len(value.args), 2)
            self.assertIsInstance(value.args[0], ast.Constant)
            self.assertEqual(value.args[0].value, environment_name)
            self.assertIsInstance(value.args[1], ast.Constant)
            self.assertEqual(value.args[1].value, "")
            self.assertEqual(value.keywords, [])

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
