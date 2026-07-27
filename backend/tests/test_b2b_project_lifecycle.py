import asyncio

import pytest

from b2b_domain import B2BDomainError, validate_project_transition
from b2b_service import B2BService
from tests.test_b2b_quote_conversion import EnabledGuard, FakeDatabase
from tests.test_b2b_quote_lifecycle import converted_quote


async def accepted_quote(service):
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
    return quote, actor


def test_project_transition_graph():
    validate_project_transition("planned", "active", reason="Kickoff complete")
    validate_project_transition("active", "on_hold", reason="Awaiting customer input")
    validate_project_transition("on_hold", "active", reason="Input received")
    validate_project_transition("active", "completed", reason="All gates passed")

    with pytest.raises(B2BDomainError) as skipped:
        validate_project_transition("planned", "completed", reason="Skip delivery")
    assert skipped.value.code == "project_transition_invalid"

    with pytest.raises(B2BDomainError) as terminal:
        validate_project_transition("completed", "active", reason="Rewrite history")
    assert terminal.value.code == "project_terminal"


def test_accepted_quote_creates_exactly_one_project():
    async def scenario():
        db = FakeDatabase()
        db.b2b_projects = type(db.b2b_quotes)()
        guard = EnabledGuard()
        service = B2BService(db=db, transaction_guard=guard)
        quote, actor = await accepted_quote(service)

        first = await service.create_project_from_quote(
            quote["id"],
            expected_version=quote["version"],
            operation_id="op-create-project",
            reason="Accepted scope ready for delivery",
            actor=actor,
        )
        replay = await service.create_project_from_quote(
            quote["id"],
            expected_version=quote["version"],
            operation_id="op-create-project",
            reason="Accepted scope ready for delivery",
            actor=actor,
        )

        assert first["project"]["id"] == replay["project"]["id"]
        assert len(db.b2b_projects.items) == 1
        assert first["project"]["status"] == "planned"
        assert first["project"]["source_quote_version_id"] == quote[
            "accepted_version_id"
        ]
        assert first["project"]["quote_snapshot"]["revision"] == 1
        assert first["quote"]["project_id"] == first["project"]["id"]
        assert first["quote"]["permitted_next_actions"] == []

        with pytest.raises(B2BDomainError) as duplicate:
            await service.create_project_from_quote(
                quote["id"],
                expected_version=first["quote"]["version"],
                operation_id="op-create-project-other",
                reason="Duplicate project",
                actor=actor,
            )
        assert duplicate.value.code == "project_already_created"

    asyncio.run(scenario())


def test_project_status_history_is_version_guarded():
    async def scenario():
        db = FakeDatabase()
        db.b2b_projects = type(db.b2b_quotes)()
        service = B2BService(db=db, transaction_guard=EnabledGuard())
        quote, actor = await accepted_quote(service)
        created = await service.create_project_from_quote(
            quote["id"],
            expected_version=quote["version"],
            operation_id="op-create-project",
            reason="Accepted scope ready for delivery",
            actor=actor,
        )
        project = created["project"]
        active = await service.transition_project(
            project["id"],
            target_status="active",
            expected_version=1,
            operation_id="op-project-active",
            reason="Kickoff complete",
            actor=actor,
        )
        assert active["version"] == 2
        assert active["history"][-1]["from_status"] == "planned"

        with pytest.raises(B2BDomainError) as stale:
            await service.transition_project(
                project["id"],
                target_status="on_hold",
                expected_version=1,
                operation_id="op-project-hold",
                reason="Awaiting customer input",
                actor=actor,
            )
        assert stale.value.code == "version_conflict"

    asyncio.run(scenario())
