"""Durable, provider-neutral notification outbox worker."""

from __future__ import annotations

import logging

from notification_service import NotificationService

logger = logging.getLogger(__name__)


class NotificationDeliveryWorker:
    def __init__(
        self,
        *,
        service: NotificationService,
        worker_id: str,
        deliverers: dict,
    ):
        self.service = service
        self.worker_id = worker_id
        self.deliverers = deliverers

    async def run_once(self, *, limit: int = 50) -> dict:
        entries = await self.service.claim_pending(
            worker_id=self.worker_id,
            limit=limit,
        )
        delivered = 0
        failed = 0
        for entry in entries:
            deliverer = self.deliverers.get(entry["channel"])
            error = None
            success = False
            try:
                if deliverer is None:
                    raise RuntimeError(
                        f"Unsupported notification channel: {entry['channel']}"
                    )
                result = await deliverer(
                    entry,
                    idempotency_key=entry["delivery_key"],
                )
                success = result is not False
            except Exception as exc:
                error = type(exc).__name__
                logger.exception(
                    "Notification delivery failed outbox_id=%s channel=%s",
                    entry["id"],
                    entry["channel"],
                )
            await self.service.record_delivery_result(
                entry["id"],
                lease_token=entry["lease_token"],
                delivered=success,
                error=error,
            )
            if success:
                delivered += 1
            else:
                failed += 1
        return {
            "claimed": len(entries),
            "delivered": delivered,
            "failed": failed,
        }
