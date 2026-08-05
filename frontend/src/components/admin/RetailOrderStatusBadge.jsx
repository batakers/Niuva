import React from "react";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";

const RETAIL_ORDER_STATUS_TONES = {
  created: "warning",
  awaiting_payment: "primary",
  paid: "info",
  file_review: "warning",
  queued: "warning",
  in_production: "info",
  quality_control: "warning",
  ready_to_ship: "info",
  ready_to_pickup: "info",
  shipped: "info",
  picked_up: "success",
  completed: "success",
};

export function RetailOrderStatusBadge({ status, className }) {
  const { t } = useI18n();

  return (
    <Badge tone={RETAIL_ORDER_STATUS_TONES[status]} className={className}>
      {t(`status.${status}`)}
    </Badge>
  );
}
