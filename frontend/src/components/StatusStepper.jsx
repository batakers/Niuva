import React from "react";
import { Check } from "lucide-react";
import { useI18n } from "../i18n";

const STEPS = ["pending_estimate", "awaiting_payment", "in_process", "completed"];

export function StatusStepper({ status }) {
  const { t } = useI18n();
  const current = status === "cancelled" ? -1 : STEPS.indexOf(status);

  return (
    <div className="flex items-center w-full" data-testid="status-stepper">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center text-center flex-shrink-0">
              <div
                className={`h-9 w-9 rounded-md grid place-items-center text-sm font-mono-tech border transition-colors ${
                  done
                    ? "bg-status-success border-status-success text-white"
                    : active
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-secondary border-border text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={2} /> : i + 1}
              </div>
              <span className={`mt-2 text-[11px] w-20 leading-tight ${active || done ? "text-foreground" : "text-muted-foreground"}`}>
                {t(`status.${s}`)}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-6 ${i < current ? "bg-status-success" : "bg-border"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function StatusBadge({ status }) {
  const { t } = useI18n();
  const map = {
    pending_estimate: "bg-status-warning/15 text-status-warning border-status-warning/30",
    awaiting_payment: "bg-primary/10 text-primary border-primary/25",
    in_process: "bg-signal/15 text-primary border-signal/30",
    completed: "bg-status-success/15 text-status-success border-status-success/30",
    cancelled: "bg-destructive/10 text-destructive border-destructive/25",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${map[status] || "bg-secondary text-muted-foreground border-border"}`}>
      {t(`status.${status}`)}
    </span>
  );
}
