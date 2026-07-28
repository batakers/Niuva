import asyncio
from datetime import datetime, timezone
import pytest

from b2b_domain import B2BDomainError, validate_quote_transition
from b2b_service import B2BService

from tests.test_b2b_quote_conversion import (
    EnabledGuard,
    FakeDatabase,
    qualified_inquiry,
)


def test_quote_transition_graph():
    validate_quote_transition("draft", "internal_review", reason="Ready")
    validate_quote_transition("internal_review", "sent", reason="Approved internally")
    validate_quote_transition("sent", "accepted", reason="Customer approval recorded")
    validate_quote_transition(
        "sent",
        "revision_requested",
        reason="Customer requested a scope adjustment",
    )

    with pytest.raises(B2BDomainError) as skipped:
        validate_quote_transition("draft", "accepted", reason="Skip review")
    assert skipped.value.code == "quote_transition_invalid"

    with pytest.raises(B2BDomainError) as terminal:
        validate_quote_transition("accepted", "sent", reason="Rewrite accepted quote")
    assert terminal.value.code == "quote_terminal"


async def converted_quote(service):
    inquiry, actor = await qualified_inquiry(service)
    result = await service.convert_inquiry(
        inquiry["id"],
        expected_version=inquiry["version"],
        operation_id="op-convert",
        reason="Scope qualified",
        actor=actor,
    )
    quote = result["quote"]
    authored = await service.create_quote_revision(
        quote["id"],
        expected_version=quote["version"],
        operation_id="op-initial-authoring",
        reason="Initial commercial authoring",
        scope_snapshot=quote["current_version"]["scope_snapshot"],
        items=[
            {
                "description": "Engineering service",
                "quantity": 1,
                "unit_price_minor": 1000000,
                "variant_id": None,
            }
        ],
        total_minor=None,
        actor=actor,
    )
    return authored, actor


def test_quote_acceptance_locks_the_accepted_version():
    async def scenario():
        service = B2BService(db=FakeDatabase(), transaction_guard=EnabledGuard())
        quote, actor = await converted_quote(service)

        for target in ["internal_review", "sent"]:
            quote = await service.transition_quote(
                quote["id"],
                target_status=target,
                expected_version=quote["version"],
                operation_id=f"op-{target}",
                reason=f"Move to {target}",
                actor=actor,
            )
        quote = await service.accept_quote(
            quote["id"],
            expected_version=quote["version"],
            operation_id="op-accepted",
            reason="Customer approval recorded",
            approver={"name": "Ayu", "identity": "ayu@example.com"},
            accepted_at=datetime.now(timezone.utc),
            channel="email",
            evidence_reference="email-thread-001",
            actor=actor,
        )

        assert quote["status"] == "accepted"
        assert quote["accepted_version_id"] == quote["current_version_id"]
        assert quote["permitted_next_actions"] == ["create_project"]

        replay = await service.accept_quote(
            quote["id"],
            expected_version=quote["version"] - 1,
            operation_id="op-accepted",
            reason="Customer approval recorded",
            approver={"name": "Ayu", "identity": "ayu@example.com"},
            accepted_at=datetime.now(timezone.utc),
            channel="email",
            evidence_reference="email-thread-001",
            actor=actor,
        )
        assert replay["version"] == quote["version"]
        assert len(replay["history"]) == len(quote["history"])

    asyncio.run(scenario())


def test_scope_change_creates_new_immutable_revision():
    async def scenario():
        db = FakeDatabase()
        guard = EnabledGuard()
        service = B2BService(db=db, transaction_guard=guard)
        quote, actor = await converted_quote(service)
        for target in ["internal_review", "sent", "revision_requested"]:
            quote = await service.transition_quote(
                quote["id"],
                target_status=target,
                expected_version=quote["version"],
                operation_id=f"op-{target}",
                reason=f"Move to {target}",
                actor=actor,
            )

        original = dict(db.b2b_quote_versions.items[-1])
        revised = await service.create_quote_revision(
            quote["id"],
            expected_version=quote["version"],
            operation_id="op-revision-2",
            reason="Quantity and scope revised",
            scope_snapshot={
                **original["scope_snapshot"],
                "brief": "Revised functional prototype scope",
            },
            items=[
                {
                    "description": "Prototype enclosure",
                    "quantity": 2,
                    "unit_price_minor": 12500000,
                    "variant_id": None,
                }
            ],
            total_minor=None,
            actor=actor,
        )

        assert revised["status"] == "draft"
        assert revised["current_revision"] == 3
        assert revised["current_version"]["revision"] == 3
        # Derived from the line, not taken from the caller.
        assert revised["current_version"]["total_minor"] == 25000000
        line = revised["current_version"]["items"][0]
        assert line["line_total_minor"] == 25000000
        # No catalog reference, so there is nothing authoritative to snapshot.
        assert line["variant_id"] is None
        assert line["product_snapshot"] is None
        assert len(db.b2b_quote_versions.items) == 3
        assert db.b2b_quote_versions.items[1] == original
        assert guard.calls[-1]["operation_name"] == "b2b.create_quote_revision"

    asyncio.run(scenario())
