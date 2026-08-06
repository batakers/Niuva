import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

const STATUS_META = {
  active: {
    labelKey: "account.status.active",
    className:
      "border-status-success/40 bg-status-success/10 text-status-success",
  },
  disabled: {
    labelKey: "account.status.disabled",
    className: "border-status-error/40 bg-status-error/10 text-status-error",
  },
};

export function AccountStatusBadge({ status }) {
  const { t } = useI18n();
  const meta = STATUS_META[status] || {
    labelKey: "account.status.unknown",
    className: "border-border-default bg-surface-muted text-text-secondary",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-control border px-2 py-1 type-body-small",
        meta.className,
      )}
    >
      {t(meta.labelKey)}
    </span>
  );
}
