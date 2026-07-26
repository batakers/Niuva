"""CMS review lifecycle, scheduled activation, and publish authority.

The gap that mattered most: a scheduled block sat at status "scheduled" and
the public read only ever asked for "published", so scheduling silently meant
never publishing.
"""

import pytest

from content_domain import (
    CONTENT_STATUSES,
    CONTENT_TRANSITIONS,
    ContentTransitionError,
    content_next_actions,
    content_requires_publish_authority,
    validate_content_transition,
)


def test_the_lifecycle_reviews_before_it_reaches_the_public():
    validate_content_transition("draft", "review")
    validate_content_transition("review", "preview")
    validate_content_transition("preview", "published")

    with pytest.raises(ContentTransitionError) as skipped:
        validate_content_transition("draft", "published")
    assert skipped.value.code == "content_transition_invalid"
    # The refusal says where the block actually is and what it can do next.
    assert skipped.value.details["current_status"] == "draft"
    assert skipped.value.details["permitted_next_actions"] == [
        "submit_review",
        "archive",
    ]


def test_review_can_send_work_back():
    validate_content_transition("review", "draft")
    validate_content_transition("preview", "review")
    validate_content_transition("scheduled", "preview")


def test_published_work_is_revised_through_a_new_draft():
    """Editing live copy in place would change the public page with no review."""
    validate_content_transition("published", "draft")
    assert "revise" in content_next_actions("published")


def test_archive_is_reversible():
    validate_content_transition("archived", "draft")
    assert content_next_actions("archived") == ["restore"]
    for status in ("draft", "review", "preview", "scheduled", "published"):
        validate_content_transition(status, "archived")


def test_every_status_is_reachable_from_draft():
    reachable = {"draft"}
    frontier = ["draft"]
    while frontier:
        for target in CONTENT_TRANSITIONS[frontier.pop()]:
            if target not in reachable:
                reachable.add(target)
                frontier.append(target)

    assert reachable == set(CONTENT_STATUSES)


def test_only_reaching_the_public_needs_approval():
    assert content_requires_publish_authority("published") is True
    assert content_requires_publish_authority("scheduled") is True
    # Authoring a block through the review stages is not an approval.
    for status in ("draft", "review", "preview", "archived"):
        assert content_requires_publish_authority(status) is False
