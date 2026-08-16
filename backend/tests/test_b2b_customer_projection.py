"""Customer-safe projection boundary for B2B aggregates.

Per Master Spec, a customer projection never carries cost, margin, supplier,
profit, internal notes, raw payment payloads, or internal audit data. These
tests hold that line by construction: the projections are allowlists, so the
decisive cases are the ones where an aggregate grows a field nobody told the
projection about.
"""

import asyncio

import httpx
from b2b_domain import (
    CUSTOMER_QUOTE_ITEM_FIELDS,
    project_customer_inquiry,
    project_customer_project,
    project_customer_quote,
)

from tests.test_b2b_inquiry_routes import INTAKE_SUBMISSION, build_context

# Names that must never reach a customer, whatever nests them.
FORBIDDEN_KEYS = frozenset(
    {
        "cost_minor",
        "unit_cost_minor",
        "margin_minor",
        "margin_percent",
        "profit_minor",
        "supplier_id",
        "supplier_name",
        "internal_notes",
        "payment_payload",
        "raw_payment_payload",
        "audit_trail",
        "history",
        "actor_user_id",
        "created_by",
        "operation_id",
        "permitted_next_actions",
        "version",
    }
)


def collect_keys(value) -> set:
    """Every mapping key anywhere in the structure, at any depth."""
    found = set()
    if isinstance(value, dict):
        for key, item in value.items():
            found.add(key)
            found |= collect_keys(item)
    elif isinstance(value, list):
        for item in value:
            found |= collect_keys(item)
    return found


def poisoned(document: dict) -> dict:
    """A record that also carries every field a customer must never see."""
    return {**document, **{key: "LEAK" for key in FORBIDDEN_KEYS}}


INQUIRY = {
    "id": "inq-1",
    "company": "PT Contoh Industri",
    "pic_name": "Ayu",
    "pic_email": "ayu@example.com",
    "pic_phone": "+628123456789",
    "need": "Prototype enclosure",
    "timeline": "Q4 2026",
    "brief": "Validasi desain dan prototype fungsional.",
    "status": "reviewed",
    "version": 2,
    "converted_quote_id": "quote-1",
    "history": [{"actor_user_id": "user-1", "reason": "Internal triage note"}],
    "permitted_next_actions": ["contact", "reject"],
    "created_at": "2026-07-26T00:00:00Z",
    "updated_at": "2026-07-26T01:00:00Z",
}

QUOTE = {
    "id": "quote-1",
    "inquiry_id": "inq-1",
    "status": "sent",
    "version": 3,
    "current_revision": 2,
    "current_version_id": "ver-2",
    "accepted_version_id": None,
    "project_id": None,
    "history": [{"actor_user_id": "user-1", "reason": "Dikirim ke pelanggan"}],
    "created_at": "2026-07-26T00:00:00Z",
    "updated_at": "2026-07-26T02:00:00Z",
}

QUOTE_VERSION = {
    "id": "ver-2",
    "quote_id": "quote-1",
    "revision": 2,
    "scope_snapshot": {
        "company": "PT Contoh Industri",
        "pic_name": "Ayu",
        "pic_email": "ayu@example.com",
        "pic_phone": "+628123456789",
        "need": "Prototype enclosure",
        "timeline": "Q4 2026",
        "brief": "Validasi desain dan prototype fungsional.",
    },
    "items": [
        {
            "description": "Desain enclosure",
            "quantity": 2,
            "unit_price_minor": 1500000,
            "line_total_minor": 3000000,
        }
    ],
    "currency": "IDR",
    "total_minor": 3000000,
    "created_by": "user-1",
    "reason": "Revisi setelah diskusi internal",
    "created_at": "2026-07-26T02:00:00Z",
}

PROJECT = {
    "id": "project-1",
    "quote_id": "quote-1",
    "inquiry_id": "inq-1",
    "source_quote_version_id": "ver-2",
    "status": "active",
    "version": 2,
    "milestones": [
        {
            "title": "Desain disetujui",
            "status": "completed",
            "due_date": "2026-08-01",
            "completed_at": "2026-07-30",
        }
    ],
    "work_order_ids": ["wo-1"],
    "history": [{"actor_user_id": "user-1", "reason": "Proyek diaktifkan"}],
    "created_at": "2026-07-26T03:00:00Z",
    "updated_at": "2026-07-26T04:00:00Z",
}


def test_inquiry_projection_withholds_triage_and_audit():
    projected = project_customer_inquiry(INQUIRY)

    assert projected["company"] == "PT Contoh Industri"
    assert projected["brief"] == "Validasi desain dan prototype fungsional."
    assert "history" not in projected
    assert "permitted_next_actions" not in projected
    assert "version" not in projected
    assert "converted_quote_id" not in projected


def test_quote_projection_prices_without_costing():
    projected = project_customer_quote(QUOTE, QUOTE_VERSION)

    assert projected["status"] == "sent"
    assert projected["current_version"]["total_minor"] == 3000000
    assert projected["current_version"]["items"][0]["description"] == "Desain enclosure"
    # Internal linkage and authorship stay inside.
    assert "inquiry_id" not in projected
    assert "current_version_id" not in projected
    assert "accepted_version_id" not in projected
    assert "project_id" not in projected
    assert "created_by" not in projected["current_version"]
    assert "reason" not in projected["current_version"]


def test_project_projection_withholds_sourcing_and_linkage():
    projected = project_customer_project(PROJECT)

    assert projected["status"] == "active"
    assert projected["milestones"][0]["title"] == "Desain disetujui"
    assert "work_order_ids" not in projected
    assert "quote_id" not in projected
    assert "source_quote_version_id" not in projected
    assert "history" not in projected


def test_projections_withhold_fields_nobody_declared():
    """The decisive case: an aggregate grows a field the projection never saw."""
    projections = (
        project_customer_inquiry(poisoned(INQUIRY)),
        project_customer_quote(
            poisoned(QUOTE),
            {
                **poisoned(QUOTE_VERSION),
                "scope_snapshot": poisoned(QUOTE_VERSION["scope_snapshot"]),
                "items": [poisoned(QUOTE_VERSION["items"][0])],
            },
        ),
        project_customer_project(
            {
                **poisoned(PROJECT),
                "milestones": [poisoned(PROJECT["milestones"][0])],
            }
        ),
    )

    for projected in projections:
        leaked = collect_keys(projected) & FORBIDDEN_KEYS
        assert leaked == set(), leaked


def test_quote_items_expose_price_but_never_cost():
    assert "unit_price_minor" in CUSTOMER_QUOTE_ITEM_FIELDS
    assert not any(
        field
        for field in CUSTOMER_QUOTE_ITEM_FIELDS
        if "cost" in field or "margin" in field
    )


def test_projections_do_not_mutate_the_source_document():
    inquiry = dict(INQUIRY)
    project_customer_inquiry(inquiry)
    assert inquiry == INQUIRY

    project = {**PROJECT, "milestones": [dict(PROJECT["milestones"][0])]}
    snapshot = {**project, "milestones": [dict(project["milestones"][0])]}
    project_customer_project(project)
    assert project == snapshot


def test_public_intake_response_is_customer_safe():
    """The anonymous submitter gets its own request back, nothing more."""

    async def scenario():
        app = build_context()
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as api:
            created = await api.post("/api/inquiries", json=INTAKE_SUBMISSION)
            assert created.status_code == 201
            return created.json()

    body = asyncio.run(scenario())

    assert body["company"] == "PT Contoh Industri"
    assert body["id"]
    leaked = collect_keys(body) & FORBIDDEN_KEYS
    assert leaked == set(), leaked
