import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  Clock3,
  FileQuestion,
  Loader2,
  RefreshCw,
  SearchX,
  ShieldAlert,
  WifiOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATE_META = {
  loading: { icon: Loader2, tone: "text-action-primary", animate: true },
  empty: { icon: FileQuestion, tone: "text-text-secondary" },
  "no-match": { icon: SearchX, tone: "text-text-secondary" },
  error: { icon: WifiOff, tone: "text-status-error" },
  conflict: { icon: ShieldAlert, tone: "text-status-warning" },
  stale: { icon: RefreshCw, tone: "text-status-warning" },
  expired: { icon: Clock3, tone: "text-status-warning" },
  unavailable: { icon: WifiOff, tone: "text-status-error" },
  uncertain: { icon: CircleHelp, tone: "text-status-warning" },
  success: { icon: CheckCircle2, tone: "text-status-success" },
};

export function OperationalState({
  state,
  title,
  description,
  retryLabel,
  onRetry,
  className,
}) {
  const meta = STATE_META[state] || {
    icon: AlertTriangle,
    tone: "text-text-secondary",
  };
  const Icon = meta.icon;
  const urgent =
    state === "error" || state === "conflict" || state === "uncertain";

  return (
    <section
      data-testid={`operational-state-${state}`}
      data-state={state}
      role={urgent ? "alert" : "status"}
      aria-live={urgent ? "assertive" : "polite"}
      aria-busy={state === "loading" ? "true" : undefined}
      className={cn(
        "flex min-h-52 flex-col items-center justify-center border border-border-decorative bg-surface-default p-8 text-center",
        className
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "h-7 w-7",
          meta.tone,
          meta.animate && "motion-safe:animate-spin"
        )}
        strokeWidth={1.6}
      />
      <h2 className="mt-4 font-heading text-lg font-semibold text-text-primary">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-lg text-base leading-6 text-text-secondary md:text-sm">
          {description}
        </p>
      )}
      {onRetry && (
        <Button type="button" variant="outline" className="mt-5 min-h-11" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {retryLabel}
        </Button>
      )}
    </section>
  );
}
