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
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : active
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-[#1E2130] border-slate-700 text-slate-500"
                }`}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={2} /> : i + 1}
              </div>
              <span className={`mt-2 text-[11px] w-20 leading-tight ${active || done ? "text-slate-200" : "text-slate-500"}`}>
                {t(`status.${s}`)}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-6 ${i < current ? "bg-emerald-500" : "bg-slate-700"}`} />
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
    pending_estimate: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    awaiting_payment: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    in_process: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border ${map[status] || ""}`}>
      {t(`status.${status}`)}
    </span>
  );
}
