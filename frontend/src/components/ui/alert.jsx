import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Alert — shared error/warning/info message box. Single source of truth for
 * markup that was previously duplicated inline across admin pages with
 * inconsistent radius (rounded-md vs rounded-control) and color tokens
 * (destructive vs status-error). `status-error` is canonical for error
 * *state* communication; `destructive` stays reserved for destructive
 * *action* affordances (buttons).
 */
const alertVariants = cva(
  "rounded-control border p-3 text-base leading-6 md:text-sm md:leading-5",
  {
    variants: {
      tone: {
        info: "border-status-info bg-status-info-surface text-status-info",
        success: "border-status-success bg-status-success-surface text-status-success",
        warning: "border-status-warning bg-status-warning-surface text-status-warning",
        error: "border-status-error bg-status-error-surface text-status-error",
        default: "border-border-decorative bg-surface-muted text-text-secondary",
      },
    },
    defaultVariants: {
      tone: "error",
    },
  }
);

const Alert = React.forwardRef(
  ({ className, tone, role = "alert", ...props }, ref) => {
    const resolvedTone = tone || "error";

    return (
      <div
        ref={ref}
        role={role}
        data-tone={resolvedTone}
        className={cn(alertVariants({ tone }), className)}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert";

export { Alert, alertVariants };
