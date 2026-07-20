import ast
import unittest
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
INTEGRATION_TEST = REPOSITORY_ROOT / "backend" / "tests" / "backend_test.py"
STALE_ITERATION_REPORT = REPOSITORY_ROOT / "test_reports" / "iteration_1.json"
GITIGNORE = REPOSITORY_ROOT / ".gitignore"


class RepositoryCredentialHygieneTests(unittest.TestCase):
    def assert_ast_type(self, node, expected_type, message):
        if not isinstance(node, expected_type):
            self.fail(message)

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
                self.assert_ast_type(
                    value,
                    ast.Call,
                    f"{credential_name} must normalize an environment lookup.",
                )
                self.assert_ast_type(
                    value.func,
                    ast.Attribute,
                    f"{credential_name} normalization must use an attribute call.",
                )
                self.assertEqual(value.func.attr, "strip")
                self.assertEqual(value.args, [])
                self.assertEqual(value.keywords, [])
                value = value.func.value

            self.assert_ast_type(
                value,
                ast.Call,
                f"{credential_name} must load from the required environment variable.",
            )
            self.assert_ast_type(
                value.func,
                ast.Attribute,
                f"{credential_name} must call the environment mapping.",
            )
            self.assertEqual(value.func.attr, "get")
            self.assert_ast_type(
                value.func.value,
                ast.Attribute,
                f"{credential_name} must use os.environ.",
            )
            self.assertEqual(value.func.value.attr, "environ")
            self.assert_ast_type(
                value.func.value.value,
                ast.Name,
                f"{credential_name} environment lookup must originate from os.",
            )
            self.assertEqual(value.func.value.value.id, "os")
            self.assertEqual(len(value.args), 2)
            self.assert_ast_type(
                value.args[0],
                ast.Constant,
                f"{credential_name} environment key must be a constant.",
            )
            if value.args[0].value != environment_name:
                self.fail(f"{credential_name} uses the wrong environment key.")
            self.assert_ast_type(
                value.args[1],
                ast.Constant,
                f"{credential_name} default must be a constant.",
            )
            if value.args[1].value != "":
                self.fail(f"{credential_name} must default to an empty value.")
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

        if "test_reports/iteration_*.json" not in patterns:
            self.fail("Generated iteration reports must be ignored.")


if __name__ == "__main__":
    unittest.main()
