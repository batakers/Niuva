"""Durable, provider-neutral notification outbox worker."""

from __future__ import annotations

import asyncio
import logging
import re

from notification_service import NotificationService

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
            entry_id = entry.get("id") if isinstance(entry, dict) else None
            lease_token = entry.get("lease_token") if isinstance(entry, dict) else None
            if (
                not isinstance(entry_id, str)
                or not 0 < len(entry_id) <= 200
                or not isinstance(lease_token, str)
                or not 0 < len(lease_token) <= 200
            ):
                logger.warning("notification_delivery_invalid_identity")
                failed += 1
                continue
            channel = entry.get("channel") if isinstance(entry, dict) else None
            deliverer = (
                self.deliverers.get(channel) if isinstance(channel, str) else None
            )
            error = None
            success = False
            try:
                if not _is_valid_delivery_entry(entry):
                    error = "invalid_delivery_entry"
                elif deliverer is None:
                    error = "unsupported_channel"
                else:
                    result = await deliverer(
                        entry,
                        idempotency_key=entry["delivery_key"],
                    )
                    success = result is True
                    if not success:
                        error = "delivery_rejected"
            except asyncio.CancelledError:
                raise
            except Exception as exc:
                error = type(exc).__name__
                logger.warning(
                    "notification_delivery_failed error_type=%s",
                    type(exc).__name__,
                )
            await self.service.record_delivery_result(
                entry_id,
                lease_token=lease_token,
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
