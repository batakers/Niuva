"""Explicit external smoke checks.

This module is intentionally named outside the hermetic ``test_*.py`` pattern.
It performs only read-only requests against an explicitly supplied,
non-production target and never accepts credentials.
"""

import os

import pytest
import requests

BASE_URL = os.environ.get("NIUVA_EXTERNAL_API_URL", "").rstrip("/")
if not BASE_URL:
    pytest.skip(
        "Set NIUVA_EXTERNAL_API_URL for the explicit external smoke job.",
        allow_module_level=True,
    )

API = f"{BASE_URL}/api"


def test_external_liveness_and_capability_boundary():
    live = requests.get(f"{API}/health/live", timeout=20)
    assert live.status_code == 200
    assert live.json()["status"] == "ok"

    capabilities = requests.get(f"{API}/capabilities", timeout=20)
    assert capabilities.status_code == 200
    payload = capabilities.json()
    assert payload["retail_discovery"] == "active"
    for capability in (
        "retail_create",
        "legacy_order_create",
        "checkout",
        "payment",
        "production_upload",
        "organization_portal",
    ):
        assert payload[capability] == "inactive"


def test_external_retail_catalog_is_a_bounded_public_read():
    response = requests.get(
        f"{API}/catalog/products",
        params={"limit": 1},
        timeout=20,
    )
    assert response.status_code == 200
    payload = response.json()
    assert set(payload) == {"items", "next_cursor"}
    assert len(payload["items"]) <= 1
