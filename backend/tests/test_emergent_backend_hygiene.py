import unittest
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]


class BackendEmergentHygieneTests(unittest.TestCase):
    def test_active_backend_has_no_emergent_storage_integration(self):
        active_backend_files = (
            REPOSITORY_ROOT / "backend" / "storage.py",
            REPOSITORY_ROOT / "backend" / "server.py",
            REPOSITORY_ROOT / "backend" / "requirements.txt",
            REPOSITORY_ROOT / "backend" / ".env.example",
        )
        legacy_markers = (
            "integrations.emergentagent.com",
            "emergent_llm_key",
            "emergentintegrations",
        )

        for path in active_backend_files:
            source = path.read_text(encoding="utf-8").lower()
            for marker in legacy_markers:
                with self.subTest(
                    path=str(path.relative_to(REPOSITORY_ROOT)),
                    marker=marker,
                ):
                    self.assertNotIn(marker, source)

    def test_active_deployment_guidance_has_no_emergent_reference(self):
        active_documentation = (
            REPOSITORY_ROOT / "doc" / "PRODUCTION_DEPLOYMENT.md",
            REPOSITORY_ROOT
            / "doc"
            / "brand"
            / "HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md",
        )

        for path in active_documentation:
            source = path.read_text(encoding="utf-8").lower()
            with self.subTest(path=str(path.relative_to(REPOSITORY_ROOT))):
                self.assertNotIn("emergent", source)


if __name__ == "__main__":
    unittest.main()
