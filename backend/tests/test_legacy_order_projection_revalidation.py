from retail_domain import project_customer_legacy_order, project_internal_legacy_order


def _legacy_order():
    return {
        "id": "order-1",
        "order_number": "ORD-1",
        "material_name": "Prototype",
        "status": "paid",
        "created_at": "2026-01-01T00:00:00Z",
        "user_id": "customer-1",
        "notes": "internal handling note",
        "storage_path": "private/raw/path.stl",
        "file": {
            "original_filename": "part.stl",
            "content_type": "model/stl",
            "size": 42,
            "storage_path": "private/raw/path.stl",
        },
        "payment": {
            "verified": True,
            "proof": {"storage_path": "private/proof.png"},
            "provider_payload": "private",
        },
        "status_history": [
            {"status": "paid", "at": "2026-01-01T00:00:00Z", "note": "private"}
        ],
    }


def test_customer_projection_is_read_only_and_never_exposes_storage_or_notes():
    result = project_customer_legacy_order(_legacy_order())
    assert result["record_class"] == "legacy_order"
    assert result["mutations_enabled"] is False
    assert result["file"] == {
        "original_filename": "part.stl",
        "content_type": "model/stl",
        "size": 42,
    }
    assert result["payment"]["proof_recorded"] is True
    assert result["status_history"] == [
        {"status": "paid", "at": "2026-01-01T00:00:00Z"}
    ]
    assert "storage_path" not in result
    assert "notes" not in result
    assert "provider_payload" not in result["payment"]


def test_internal_projection_requires_explicit_flags_for_sensitive_history():
    result = project_internal_legacy_order(
        _legacy_order(), include_payment=False, include_operational_notes=False
    )
    assert "payment" not in result
    assert "estimate" not in result
    assert "notes" not in result
    assert "note" not in result["status_history"][0]
    assert result["file"]["historical_file_recorded"] is True

