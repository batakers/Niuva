from b2b_domain import (
    project_customer_inquiry,
    project_customer_project,
    project_customer_quote,
)

PRIVATE_FIELDS = {
    "cost_minor",
    "margin_minor",
    "profit_minor",
    "supplier_reference",
    "internal_notes",
    "payment_payload",
    "audit_history",
    "organization_id",
}


def test_customer_inquiry_projection_is_allowlisted():
    source = {
        "id": "inq-1",
        "company": "Example",
        "status": "new",
        **{field: "private" for field in PRIVATE_FIELDS},
    }
    result = project_customer_inquiry(source)
    assert result["id"] == "inq-1"
    assert PRIVATE_FIELDS.isdisjoint(result)


def test_customer_quote_projection_keeps_price_but_withholds_internal_data():
    quote = {"id": "quote-1", "status": "sent", "cost_minor": 1}
    version = {
        "revision": 2,
        "currency": "IDR",
        "total_minor": 5000,
        "items": [
            {
                "description": "Desk",
                "quantity": 1,
                "unit_price_minor": 5000,
                "line_total_minor": 5000,
                "supplier_reference": "private",
            }
        ],
        "scope_snapshot": {"company": "Example", "internal_notes": "private"},
        "cost_minor": 1,
    }
    result = project_customer_quote(quote, version)
    assert result["current_version"]["items"] == [
        {
            "description": "Desk",
            "quantity": 1,
            "unit_price_minor": 5000,
            "line_total_minor": 5000,
        }
    ]
    assert PRIVATE_FIELDS.isdisjoint(result)
    assert PRIVATE_FIELDS.isdisjoint(result["current_version"])
    assert PRIVATE_FIELDS.isdisjoint(result["current_version"]["scope_snapshot"])


def test_customer_project_projection_does_not_leak_work_order_or_private_fields():
    result = project_customer_project(
        {
            "id": "project-1",
            "status": "in_progress",
            "milestones": [{"title": "Build", "status": "queued", "cost_minor": 2}],
            "work_orders": [{"id": "wo-1"}],
            "supplier_reference": "private",
        }
    )
    assert result["milestones"] == [{"title": "Build", "status": "queued"}]
    assert "work_orders" not in result
    assert PRIVATE_FIELDS.isdisjoint(result)
