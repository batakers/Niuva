import React from "react";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";

const B2B_STATUS_TONES = {
  inquiry: {
    new: "warning",
    reviewed: "info",
    contacted: "info",
    converted: "success",
    rejected: "danger",
  },
  quote: {
    draft: "muted",
    internal_review: "warning",
    sent: "info",
    accepted: "success",
    revision_requested: "warning",
    expired: "danger",
    rejected: "danger",
  },
  project: {
    planned: "warning",
    active: "info",
    on_hold: "warning",
    completed: "success",
    cancelled: "danger",
  },
};

export function B2BStatusBadge({ kind, status, className }) {
  const { t } = useI18n();

  return (
    <Badge tone={B2B_STATUS_TONES[kind]?.[status]} className={className}>
      {t(`status.${status}`)}
    </Badge>
  );
}
