import pytest

from b2b_domain import (
    B2BDomainError,
    inquiry_next_actions,
    validate_inquiry_transition,
)


def test_inquiry_transition_graph_and_terminal_states():
    validate_inquiry_transition("new", "reviewed", reason="Brief checked")
    validate_inquiry_transition("reviewed", "contacted", reason="PIC contacted")
    validate_inquiry_transition("contacted", "converted", reason="Scope qualified")

    with pytest.raises(B2BDomainError) as invalid:
        validate_inquiry_transition("new", "converted", reason="Skip review")
    assert invalid.value.code == "inquiry_transition_invalid"

    with pytest.raises(B2BDomainError) as terminal:
        validate_inquiry_transition("converted", "reviewed", reason="Reopen")
    assert terminal.value.code == "inquiry_terminal"


def test_rejection_requires_a_reason():
    with pytest.raises(B2BDomainError) as missing_reason:
        validate_inquiry_transition("reviewed", "rejected", reason=" ")

    assert missing_reason.value.code == "reason_required"
    validate_inquiry_transition(
        "reviewed",
        "rejected",
        reason="Kebutuhan berada di luar kapabilitas yang disetujui",
    )


def test_next_actions_are_status_specific():
    assert inquiry_next_actions("new") == ["review", "reject"]
    assert inquiry_next_actions("reviewed") == ["contact", "reject"]
    assert inquiry_next_actions("contacted") == ["convert", "reject"]
    assert inquiry_next_actions("converted") == []
    assert inquiry_next_actions("rejected") == []
