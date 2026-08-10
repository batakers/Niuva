"""Shared timestamp parsing for pure backend contracts."""

from datetime import datetime


def parse_aware_timestamp(value: str) -> datetime:
    """Parse an ISO 8601 timestamp and reject values without an offset."""

    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        raise ValueError("timezone offset required")
    return parsed
