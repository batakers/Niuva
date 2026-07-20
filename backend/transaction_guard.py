from typing import Awaitable, Callable, TypeVar

from transaction_execution import (
    RetryMode,
    TransactionExecutor,
    TransactionUnavailableError,
)

T = TypeVar("T")
MutationCallback = Callable[[object], Awaitable[T]]
EnabledProvider = Callable[[], bool]


class TransactionMutationGuard:
    def __init__(
        self,
        executor: TransactionExecutor,
        enabled_provider: EnabledProvider = lambda: True,
    ):
        self.executor = executor
        self.enabled_provider = enabled_provider

    async def run(
        self,
        callback: MutationCallback[T],
        *,
        operation_name: str,
        retry_safe: bool = False,
        correlation_id: str | None = None,
    ) -> T:
        if not self.enabled_provider():
            raise TransactionUnavailableError()
        retry_mode = RetryMode.NEVER
        if retry_safe:
            retry_mode = RetryMode.DRIVER_TRANSIENT
        return await self.executor.execute(
            callback,
            operation_name=operation_name,
            retry_mode=retry_mode,
            correlation_id=correlation_id,
        )
