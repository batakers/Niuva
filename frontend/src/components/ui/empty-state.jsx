import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const emptyStateVariants = cva(
  "p-12 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest",
  {
    variants: {
      frame: {
        none: "",
        solid: "border border-border bg-surface-1",
        dashed: "border border-dashed border-border bg-surface-1/50",
      },
    },
    defaultVariants: {
      frame: "none",
    },
  }
);

const EmptyState = React.forwardRef(
  ({ className, frame, as: Comp = "div", ...props }, ref) => {
    return (
      <Comp
        ref={ref}
        className={cn(emptyStateVariants({ frame }), className)}
        {...props}
      />
    );
  }
);
EmptyState.displayName = "EmptyState";

export { EmptyState, emptyStateVariants };
