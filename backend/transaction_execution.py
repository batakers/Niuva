from enum import Enum
from typing import Awaitable, Callable, TypeVar

from pymongo.errors import (
    ConfigurationError,
    ConnectionFailure,
    OperationFailure,
    PyMongoError,
    ServerSelectionTimeoutError,
)

from database_capabilities import DatabaseCapabilities

T = TypeVar("T")
TransactionCallback = Callable[[object], Awaitable[T]]
CapabilityProvider = Callable[[], DatabaseCapabilities]
EventSink = Callable[[str, dict[str, object]], None]


class RetryMode(str, Enum):
    NEVER = "never"
    DRIVER_TRANSIENT = "driver_transient"


class TransactionUnavailableError(RuntimeError):
    status_code = 503
    code = "transaction_unavailable"
    message = "Operasi sementara tidak tersedia karena transaksi database "
    message += "belum siap."

    def __init__(self):
        super().__init__(self.message)


class TransactionCommitOutcomeUnknownError(RuntimeError):
    code = "transaction_commit_outcome_unknown"
    message = "Commit outcome is unknown; reconciliation is required."
    reconciliation_required = True

    def __init__(self, *, attempts: int):
        self.attempts = attempts
        super().__init__(self.message)


def _has_error_label(exc: PyMongoError, label: str) -> bool:
    return bool(getattr(exc, "has_error_label", lambda _label: False)(label))


def _is_unavailable(exc: PyMongoError) -> bool:
    if isinstance(
        exc,
        (ConnectionFailure, ConfigurationError, ServerSelectionTimeoutError),
    ):
        return True
    return isinstance(exc, OperationFailure) and exc.code == 20


def _noop_event_sink(_event: str, _fields: dict[str, object]) -> None:
    return None


class TransactionExecutor:
    def __init__(
        self,
        client,
        capability_provider: CapabilityProvider,
        *,
        max_transaction_attempts: int = 3,
        max_commit_attempts: int = 3,
        event_sink: EventSink = _noop_event_sink,
    ):
        if max_transaction_attempts < 1 or max_commit_attempts < 1:
            message = "transaction and commit attempts must be positive"
            raise ValueError(message)
        self.client = client
        self.capability_provider = capability_provider
        self.max_transaction_attempts = max_transaction_attempts
        self.max_commit_attempts = max_commit_attempts
        self.event_sink = event_sink

    async def _abort_if_active(self, session) -> None:
        if getattr(session, "in_transaction", False):
            await session.abort_transaction()

    async def _commit(self, session) -> None:
        for attempt in range(1, self.max_commit_attempts + 1):
            try:
                await session.commit_transaction()
                return
            except PyMongoError as exc:
                if not _has_error_label(exc, "UnknownTransactionCommitResult"):
                    raise
                if attempt == self.max_commit_attempts:
                    raise TransactionCommitOutcomeUnknownError(
                        attempts=attempt
                    ) from None

    async def execute(
        self,
        callback: TransactionCallback[T],
        *,
        operation_name: str,
        retry_mode: RetryMode = RetryMode.NEVER,
        correlation_id: str | None = None,
    ) -> T:
        if not self.capability_provider().transactions:
            raise TransactionUnavailableError()

        session = None
        try:
            session = await self.client.start_session()
            for attempt in range(1, self.max_transaction_attempts + 1):
                session.start_transaction()
                try:
                    result = await callback(session)
                    await self._commit(session)
                    return result
                except TransactionCommitOutcomeUnknownError:
                    raise
                except PyMongoError as exc:
                    await self._abort_if_active(session)
                    if _is_unavailable(exc):
                        raise TransactionUnavailableError() from exc
                    retry_allowed = (
                        retry_mode is RetryMode.DRIVER_TRANSIENT
                        and _has_error_label(exc, "TransientTransactionError")
                        and attempt < self.max_transaction_attempts
                    )
                    if retry_allowed:
                        continue
                    raise
                except BaseException:
                    await self._abort_if_active(session)
                    raise
            message = "transaction attempt loop exited unexpectedly"
            raise AssertionError(message)
        except PyMongoError as exc:
            if _is_unavailable(exc):
                raise TransactionUnavailableError() from exc
            raise
        finally:
            if session is not None:
                await session.end_session()
