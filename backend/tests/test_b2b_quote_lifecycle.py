import asyncio
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
    return result["quote"], actor


def test_quote_acceptance_locks_the_accepted_version():
    async def scenario():
        service = B2BService(db=FakeDatabase(), transaction_guard=EnabledGuard())
        quote, actor = await converted_quote(service)

        for target in ["internal_review", "sent", "accepted"]:
            quote = await service.transition_quote(
                quote["id"],
                target_status=target,
                expected_version=quote["version"],
                operation_id=f"op-{target}",
                reason=f"Move to {target}",
                actor=actor,
            )

        assert quote["status"] == "accepted"
        assert quote["accepted_version_id"] == quote["current_version_id"]
        assert quote["permitted_next_actions"] == ["create_project"]

        replay = await service.transition_quote(
            quote["id"],
            target_status="accepted",
            expected_version=2,
            operation_id="op-accepted",
            reason="Move to accepted",
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

        original = dict(db.b2b_quote_versions.items[0])
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
                    "product_snapshot": {"name": "Custom engineering"},
                    "configuration_snapshot": {"finish": "functional"},
                    "material_snapshot": {"name": "Engineering polymer"},
                }
            ],
            total_minor=25000000,
            actor=actor,
        )

        assert revised["status"] == "draft"
        assert revised["current_revision"] == 2
        assert revised["current_version"]["revision"] == 2
        assert revised["current_version"]["total_minor"] == 25000000
        assert len(db.b2b_quote_versions.items) == 2
        assert db.b2b_quote_versions.items[0] == original
        assert guard.calls[-1]["operation_name"] == "b2b.create_quote_revision"

    asyncio.run(scenario())
