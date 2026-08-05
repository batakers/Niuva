import time
from enum import Enum
from typing import Awaitable, Callable, NoReturn, TypeVar

from database_capabilities import DatabaseCapabilities
from pymongo.errors import (
    ConfigurationError,
    ConnectionFailure,
    OperationFailure,
    PyMongoError,
    ServerSelectionTimeoutError,
)

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
    message = "Operasi sementara tidak tersedia karena transaksi "
    message += "database belum siap."

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
        include_duration: bool = False,
    ):
        if max_transaction_attempts < 1 or max_commit_attempts < 1:
            message = "transaction and commit attempts must be positive"
            raise ValueError(message)
        self.client = client
        self.capability_provider = capability_provider
        self.max_transaction_attempts = max_transaction_attempts
        self.max_commit_attempts = max_commit_attempts
        self.event_sink = event_sink
        self.include_duration = include_duration

    def _emit(
        self,
        event: str,
        *,
        operation_name: str,
        outcome: str,
        attempt: int,
        retry_mode: RetryMode,
        correlation_id: str | None,
        error_class: str | None = None,
        duration_ms: int | None = None,
    ) -> None:
        fields = {
            "operation_name": operation_name,
            "outcome": outcome,
            "attempt": attempt,
            "retry_mode": retry_mode.value,
            "correlation_id": correlation_id,
            "error_class": error_class,
        }
        if self.include_duration and duration_ms is not None:
            fields["duration_ms"] = max(0, min(int(duration_ms), 60000))
        self.event_sink(event, fields)

    def reject_unavailable(
        self,
        *,
        operation_name: str,
        retry_mode: RetryMode = RetryMode.NEVER,
        correlation_id: str | None = None,
    ) -> NoReturn:
        self._emit(
            "transaction_rejected",
            operation_name=operation_name,
            outcome="unavailable",
            attempt=0,
            retry_mode=retry_mode,
            correlation_id=correlation_id,
            error_class="transaction_unavailable",
            duration_ms=0,
        )
        raise TransactionUnavailableError()

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
            self.reject_unavailable(
                operation_name=operation_name,
                retry_mode=retry_mode,
                correlation_id=correlation_id,
            )

        session = None
        started_at = time.monotonic()

        def elapsed_ms() -> int:
            return max(0, min(int((time.monotonic() - started_at) * 1000), 60000))

        try:
            session = await self.client.start_session()
            for attempt in range(1, self.max_transaction_attempts + 1):
                session.start_transaction()
                self._emit(
                    "transaction_start",
                    operation_name=operation_name,
                    outcome="started",
                    attempt=attempt,
                    retry_mode=retry_mode,
                    correlation_id=correlation_id,
                    duration_ms=elapsed_ms(),
                )
                try:
                    result = await callback(session)
                    await self._commit(session)
                    self._emit(
                        "transaction_commit",
                        operation_name=operation_name,
                        outcome="committed",
                        attempt=attempt,
                        retry_mode=retry_mode,
                        correlation_id=correlation_id,
                        duration_ms=elapsed_ms(),
                    )
                    return result
                except TransactionCommitOutcomeUnknownError as exc:
                    self._emit(
                        "transaction_commit_unknown",
                        operation_name=operation_name,
                        outcome="unknown",
                        attempt=exc.attempts,
                        retry_mode=retry_mode,
                        correlation_id=correlation_id,
                        error_class="commit_outcome_unknown",
                        duration_ms=elapsed_ms(),
                    )
                    raise
                except PyMongoError as exc:
                    await self._abort_if_active(session)
                    self._emit(
                        "transaction_abort",
                        operation_name=operation_name,
                        outcome="aborted",
                        attempt=attempt,
                        retry_mode=retry_mode,
                        correlation_id=correlation_id,
                        error_class="database_error",
                        duration_ms=elapsed_ms(),
                    )
                    if _is_unavailable(exc):
                        raise TransactionUnavailableError() from exc
                    retry_allowed = (
                        retry_mode is RetryMode.DRIVER_TRANSIENT
                        and _has_error_label(exc, "TransientTransactionError")
                        and attempt < self.max_transaction_attempts
                    )
                    if retry_allowed:
                        self._emit(
                            "transaction_retry",
                            operation_name=operation_name,
                            outcome="retrying",
                            attempt=attempt,
                            retry_mode=retry_mode,
                            correlation_id=correlation_id,
                            error_class="database_error",
                            duration_ms=elapsed_ms(),
                        )
                        continue
                    raise
                except BaseException:
                    await self._abort_if_active(session)
                    self._emit(
                        "transaction_abort",
                        operation_name=operation_name,
                        outcome="aborted",
                        attempt=attempt,
                        retry_mode=retry_mode,
                        correlation_id=correlation_id,
                        error_class="application_error",
                        duration_ms=elapsed_ms(),
                    )
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
