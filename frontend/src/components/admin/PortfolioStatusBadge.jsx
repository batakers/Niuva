import React from "react";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";

const PORTFOLIO_STATUS_TONES = {
  draft: "muted",
  review: "warning",
  preview: "info",
  scheduled: "info",
  published: "success",
  archived: "muted",
};

export function PortfolioStatusBadge({ status, className }) {
  const { t } = useI18n();

  return (
    <Badge tone={PORTFOLIO_STATUS_TONES[status]} className={className}>
      {t(`status.${status}`)}
    </Badge>
  );
}
