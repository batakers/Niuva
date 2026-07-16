from datetime import datetime, timezone


def parse_effective_from(value: str | datetime) -> datetime:
    parsed = value if isinstance(value, datetime) else datetime.fromisoformat(value)
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        raise ValueError("effective_from must include a timezone")
    return parsed.astimezone(timezone.utc)


def resolve_effective_price(
    versions: list[dict], *, at: datetime | None = None
) -> dict | None:
    moment = at or datetime.now(timezone.utc)
    if moment.tzinfo is None or moment.utcoffset() is None:
        raise ValueError("at must include a timezone")
    moment = moment.astimezone(timezone.utc)
    effective = [
        (parse_effective_from(version["effective_from"]), version)
        for version in versions
        if parse_effective_from(version["effective_from"]) <= moment
    ]
    if not effective:
        return None
    return dict(max(effective, key=lambda item: item[0])[1])


def resolve_next_scheduled_price(
    versions: list[dict], *, at: datetime | None = None
) -> dict | None:
    moment = at or datetime.now(timezone.utc)
    if moment.tzinfo is None or moment.utcoffset() is None:
        raise ValueError("at must include a timezone")
    moment = moment.astimezone(timezone.utc)
    future = [
        (parse_effective_from(version["effective_from"]), version)
        for version in versions
        if parse_effective_from(version["effective_from"]) > moment
    ]
    if not future:
        return None
    return dict(min(future, key=lambda item: item[0])[1])
