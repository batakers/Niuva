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
  "rounded-control border p-3 text-sm",
  {
    variants: {
      tone: {
        error: "border-status-error/40 bg-status-error/10 text-status-error",
        warning: "border-status-warning/40 bg-status-warning/10 text-status-warning",
        default: "border-border-default bg-surface-muted text-text-secondary",
      },
    },
    defaultVariants: {
      tone: "error",
    },
  }
);

const Alert = React.forwardRef(
  ({ className, tone, role = "alert", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={role}
        className={cn(alertVariants({ tone }), className)}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert";

export { Alert, alertVariants };
