import React from "react";
import { Check } from "lucide-react";
import { useI18n } from "@/i18n";

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
                    ? "bg-primary border-primary text-text-on-primary"
                    : "bg-secondary border-border-default text-text-secondary"
                }`}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={2} /> : i + 1}
              </div>
              <span className={`mt-2 text-[11px] w-20 leading-tight ${active || done ? "text-text-primary" : "text-text-secondary"}`}>
                {t(`status.${s}`)}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-6 ${i < current ? "bg-status-success" : "bg-border-default"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function StatusBadge({ status }) {
  const { t } = useI18n();
  const attention = "bg-status-warning/15 text-status-warning border-status-warning/30";
  const inFlight = "bg-signal/15 text-primary border-signal/30";
  const settled = "bg-status-success/15 text-status-success border-status-success/30";
  const terminated = "bg-destructive/10 text-destructive border-destructive/25";
  const map = {
    pending_estimate: attention,
    awaiting_payment: "bg-primary/10 text-primary border-primary/25",
    in_process: inFlight,
    completed: settled,
    cancelled: terminated,

    // B2B Inquiry
    new: attention,
    reviewed: inFlight,
    contacted: inFlight,
    converted: settled,
    rejected: terminated,

    // B2B Quote
    draft: "bg-secondary text-text-secondary border-border-default",
    internal_review: attention,
    sent: inFlight,
    accepted: settled,
    revision_requested: attention,
    expired: terminated,

    // B2B Project
    planned: attention,
    active: inFlight,
    on_hold: attention,

    // Work order
    in_progress: inFlight,

    // Retail order: the canonical lifecycle, from placed to handed over.
    created: attention,
    paid: inFlight,
    file_review: attention,
    queued: attention,
    in_production: inFlight,
    quality_control: attention,
    ready_to_ship: inFlight,
    ready_to_pickup: inFlight,
    shipped: inFlight,
    picked_up: settled,
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${map[status] || "bg-secondary text-text-secondary border-border-default"}`}>
      {t(`status.${status}`)}
    </span>
  );
}
