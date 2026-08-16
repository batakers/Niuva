"""Durable, provider-neutral notification outbox worker."""

from __future__ import annotations

import asyncio
import logging
import re

from notification_service import NotificationError, NotificationService
from worker_runtime import WorkerRuntimeConfig

logger = logging.getLogger(__name__)
DELIVERY_KEY_PATTERN = re.compile(r"^notification-delivery:[A-Za-z0-9._-]{1,160}$")


def _is_bounded_text(value: object, maximum: int) -> bool:
    return bool(
        isinstance(value, str)
        and 0 < len(value) <= maximum
        and not any(ord(character) < 32 or ord(character) == 127 for character in value)
    )


def _is_valid_delivery_entry(entry: object) -> bool:
    return bool(
        isinstance(entry, dict)
        and isinstance(entry.get("delivery_key"), str)
        and DELIVERY_KEY_PATTERN.fullmatch(entry["delivery_key"])
        and _is_bounded_text(entry.get("channel"), 80)
        and _is_bounded_text(entry.get("recipient"), 320)
        and isinstance(entry.get("payload"), dict)
    )


class NotificationDeliveryWorker:
    def __init__(
        self,
        *,
        service: NotificationService,
        worker_id: str,
        deliverers: dict,
        runtime_config: WorkerRuntimeConfig | None = None,
    ):
        self.service = service
        self.worker_id = worker_id
        self.deliverers = deliverers
        self.runtime_config = runtime_config or WorkerRuntimeConfig()
        self._accepting_claims = True
        self._run_lock = asyncio.Lock()

    @property
    def accepting_claims(self) -> bool:
        return self._accepting_claims

    def stop_claiming(self) -> None:
        self._accepting_claims = False

    async def _renew_until_done(
        self,
        *,
        entry_id: str,
        lease_token: str,
        finished: asyncio.Event,
    ) -> None:
        delay = max(
            0.001,
            self.runtime_config.lease_seconds
            - self.runtime_config.renewal_threshold_seconds,
        )
        while not finished.is_set():
            try:
                await asyncio.wait_for(finished.wait(), timeout=delay)
                return
            except asyncio.TimeoutError:
                pass
            try:
                await asyncio.wait_for(
                    self.service.renew_lease(
                        entry_id,
                        lease_token=lease_token,
                        lease_seconds=self.runtime_config.lease_seconds,
                    ),
                    timeout=self.runtime_config.ack_budget_seconds,
                )
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.warning("notification_delivery_renewal_failed")
                return

    async def run_once(self, *, limit: int = 50) -> dict:
        del limit  # Claim-ahead is an approved zero; one item is claimed per slot.
        async with self._run_lock:
            if not self._accepting_claims:
                return {"claimed": 0, "delivered": 0, "failed": 0}
            entries = await self.service.claim_pending(
                worker_id=self.worker_id,
                limit=1,
                lease_seconds=self.runtime_config.lease_seconds,
            )
            if not entries:
                return {"claimed": 0, "delivered": 0, "failed": 0}

            entry = entries[0]
            entry_id = entry.get("id") if isinstance(entry, dict) else None
            lease_token = entry.get("lease_token") if isinstance(entry, dict) else None
            if (
                not isinstance(entry_id, str)
                or not 0 < len(entry_id) <= 200
                or not isinstance(lease_token, str)
                or not 0 < len(lease_token) <= 200
            ):
                logger.warning("notification_delivery_invalid_identity")
                return {"claimed": 1, "delivered": 0, "failed": 1}

            channel = entry.get("channel") if isinstance(entry, dict) else None
            deliverer = (
                self.deliverers.get(channel) if isinstance(channel, str) else None
            )
            error = None
            success = False
            started = False
            finished = asyncio.Event()
            renewal_task = None
            try:
                if not _is_valid_delivery_entry(entry):
                    error = "invalid_delivery_entry"
                elif deliverer is None:
                    error = "unsupported_channel"
                else:
                    started = True
                    renewal_task = asyncio.create_task(
                        self._renew_until_done(
                            entry_id=entry_id,
                            lease_token=lease_token,
                            finished=finished,
                        )
                    )
                    try:
                        result = await asyncio.wait_for(
                            deliverer(
                                entry,
                                idempotency_key=entry["delivery_key"],
                            ),
                            timeout=self.runtime_config.max_delivery_operation_seconds,
                        )
                        success = result is True
                        if not success:
                            error = "delivery_rejected"
                    except asyncio.TimeoutError:
                        error = "delivery_timeout"
                    except asyncio.CancelledError:
                        raise
                    except Exception:
                        error = "delivery_error"
                        logger.warning("notification_delivery_failed")
            except asyncio.CancelledError:
                if not started:
                    try:
                        await asyncio.shield(
                            self.service.release_lease(
                                entry_id,
                                lease_token=lease_token,
                            )
                        )
                    except Exception:
                        logger.warning("notification_delivery_release_failed")
                raise
            finally:
                finished.set()
                if renewal_task is not None:
                    renewal_task.cancel()
                    await asyncio.gather(renewal_task, return_exceptions=True)

            try:
                recorded = await asyncio.wait_for(
                    self.service.record_delivery_result(
                        entry_id,
                        lease_token=lease_token,
                        delivered=success,
                        error=error,
                    ),
                    timeout=self.runtime_config.ack_budget_seconds,
                )
            except NotificationError as exc:
                if exc.code == "outbox_lease_lost":
                    return {
                        "claimed": 1,
                        "delivered": 0,
                        "failed": 1,
                        "lease_lost": 1,
                    }
                raise
            result = {
                "claimed": 1,
                "delivered": 1 if success else 0,
                "failed": 0 if success else 1,
            }
            if recorded.get("status") == "exhausted":
                result["exhausted"] = 1
            return result
