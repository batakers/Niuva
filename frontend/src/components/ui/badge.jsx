import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
  {
    variants: {
      tone: {
        muted: "border-border-default bg-surface-muted text-text-secondary",
        warning:
          "border-status-warning/40 bg-status-warning/15 text-text-primary",
        info: "border-signal/40 bg-signal/15 text-text-primary",
        success:
          "border-status-success/40 bg-status-success/15 text-text-primary",
        danger:
          "border-destructive/40 bg-destructive/10 text-text-primary",
        primary:
          "border-action-primary/40 bg-action-primary/10 text-text-primary",
      },
    },
    defaultVariants: {
      tone: "muted",
    },
  }
);

const Badge = React.forwardRef(({ className, tone, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(badgeVariants({ tone }), className)}
    data-tone={tone || "muted"}
    {...props}
  />
));
Badge.displayName = "Badge";

export { Badge, badgeVariants };
