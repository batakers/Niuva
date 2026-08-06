import React from "react";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";

const LEGACY_ORDER_STATUS_TONES = {
  pending_estimate: "warning",
  awaiting_payment: "primary",
  in_process: "info",
  completed: "success",
  cancelled: "danger",
};

export function LegacyOrderStatusBadge({ status, className }) {
  const { t } = useI18n();

  return (
    <Badge tone={LEGACY_ORDER_STATUS_TONES[status]} className={className}>
      {t(`status.${status}`)}
    </Badge>
  );
}
