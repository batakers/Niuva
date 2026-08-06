import React from "react";
import { Check } from "lucide-react";

import { LegacyOrderStatusBadge } from "@/components/operational/LegacyOrderStatusBadge";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

const STEPS = ["pending_estimate", "awaiting_payment", "in_process", "completed"];

export function StatusStepper({ status }) {
  const { t } = useI18n();
  const current = STEPS.indexOf(status);

  if (status === "cancelled") {
    return (
      <div
        className="flex flex-wrap items-center gap-3 border-l-2 border-status-error pl-4"
        data-testid="status-stepper"
        role="status"
      >
        <LegacyOrderStatusBadge status={status} />
        <p className="text-sm leading-6 text-text-secondary">
          {t("detail.cancelledStatus")}
        </p>
      </div>
    );
  }

  return (
    <ol
      className="grid gap-4 sm:grid-cols-4"
      data-testid="status-stepper"
      aria-label={t("detail.productionStatus")}
    >
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={s}
            aria-current={active ? "step" : undefined}
            className={cn(
              "flex min-w-0 items-center gap-3 border-l-2 pl-4 sm:block sm:border-l-0 sm:border-t-2 sm:pl-0 sm:pt-3",
              done && "border-status-success",
              active && "border-action-primary",
              !done && !active && "border-border-default"
            )}
          >
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-semibold sm:mb-3",
                done &&
                  "border-status-success bg-status-success text-text-inverse",
                active &&
                  "border-action-primary bg-action-primary text-text-inverse",
                !done &&
                  !active &&
                  "border-border-default bg-surface-muted text-text-secondary"
              )}
              aria-hidden="true"
            >
              {done ? <Check className="h-4 w-4" strokeWidth={2} /> : i + 1}
            </span>
            <div className="min-w-0">
              <span className="block text-xs text-text-secondary">
                {t("detail.stepNumber")} {i + 1}
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-sm font-semibold leading-5",
                  active || done ? "text-text-primary" : "text-text-secondary"
                )}
              >
                {t(`status.${s}`)}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
