from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Callable

from pymongo.errors import PyMongoError


class TransactionCapabilityReason(str, Enum):
    NOT_CHECKED = "not_checked"
    AVAILABLE = "available"
    REPLICA_SET_REQUIRED = "replica_set_required"
    SESSIONS_REQUIRED = "sessions_required"
    PROBE_FAILED = "probe_failed"


@dataclass(frozen=True)
class DatabaseCapabilities:
    transactions: bool
    transaction_reason: TransactionCapabilityReason = (
        TransactionCapabilityReason.NOT_CHECKED
    )
    checked_at: str | None = None

    def __post_init__(self):
        reason = self.transaction_reason
        not_checked = TransactionCapabilityReason.NOT_CHECKED
        if self.transactions and reason is not_checked:
            object.__setattr__(
                self,
                "transaction_reason",
                TransactionCapabilityReason.AVAILABLE,
            )

    def transaction_diagnostic(self) -> dict[str, bool | str | None]:
        return {
            "available": self.transactions,
            "reason": self.transaction_reason.value,
            "checked_at": self.checked_at,
        }


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def supports_transactions(hello: dict) -> bool:
    return bool(hello.get("setName")) and (
        hello.get("logicalSessionTimeoutMinutes") is not None
    )


def _capabilities(
    available: bool,
    reason: TransactionCapabilityReason,
    clock: Callable[[], datetime],
) -> DatabaseCapabilities:
    return DatabaseCapabilities(
        transactions=available,
        transaction_reason=reason,
        checked_at=clock().astimezone(timezone.utc).isoformat(),
    )


async def probe_database_capabilities(
    client,
    database_name: str,
    *,
    clock: Callable[[], datetime] = utc_now,
) -> DatabaseCapabilities:
    try:
        hello = await client.admin.command("hello")
    except PyMongoError:
        return _capabilities(
            available=False,
            reason=TransactionCapabilityReason.PROBE_FAILED,
            clock=clock,
        )

    if not hello.get("setName"):
        return _capabilities(
            False,
            TransactionCapabilityReason.REPLICA_SET_REQUIRED,
            clock,
        )
    if hello.get("logicalSessionTimeoutMinutes") is None:
        return _capabilities(
            False,
            TransactionCapabilityReason.SESSIONS_REQUIRED,
            clock,
        )

    session = None
    try:
        session = await client.start_session()
        session.start_transaction()
        await client[database_name].command(
            "find",
            "__transaction_capability_probe__",
            filter={"_id": "__read_only_probe__"},
            limit=1,
            session=session,
        )
        await session.commit_transaction()
    except PyMongoError:
        if session is not None and getattr(session, "in_transaction", True):
            try:
                await session.abort_transaction()
            except PyMongoError:
                pass
        return _capabilities(
            available=False,
            reason=TransactionCapabilityReason.PROBE_FAILED,
            clock=clock,
        )
    finally:
        if session is not None:
            try:
                await session.end_session()
            except PyMongoError:
                pass

    return _capabilities(True, TransactionCapabilityReason.AVAILABLE, clock)


async def probe_transaction_capability(client) -> bool:
    try:
        hello = await client.admin.command("hello")
    except PyMongoError:
        return False
    return supports_transactions(hello)
