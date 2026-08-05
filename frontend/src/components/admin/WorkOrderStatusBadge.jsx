import React from "react";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";

const WORK_ORDER_STATUS_TONES = {
  in_progress: "info",
  completed: "success",
  cancelled: "danger",
};

export function WorkOrderStatusBadge({ status, className }) {
  const { t } = useI18n();

  return (
    <Badge tone={WORK_ORDER_STATUS_TONES[status]} className={className}>
      {t(`status.${status}`)}
    </Badge>
  );
}
