import * as React from "react";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const emptyStateVariants = cva(
  "p-12 text-center",
  {
    variants: {
      frame: {
        none: "",
        solid: "border border-border-default bg-surface-default rounded-panel",
        dashed: "border border-dashed border-border-default bg-surface-default/50 rounded-panel",
      },
    },
    defaultVariants: {
      frame: "none",
    },
  }
);

const EmptyState = React.forwardRef(
  ({ className, frame, icon: Icon, loading, children, as: Comp = "div", ...props }, ref) => {
    return (
      <Comp
        ref={ref}
        className={cn(emptyStateVariants({ frame }), className)}
        {...props}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 text-text-secondary motion-safe:animate-spin" />
            <span className="type-body-small text-text-secondary">
              {children}
            </span>
          </div>
        ) : Icon ? (
          <div className="flex flex-col items-center gap-3">
            <Icon className="h-8 w-8 text-text-disabled" strokeWidth={1.5} />
            <span className="type-body-small text-text-secondary">
              {children}
            </span>
          </div>
        ) : (
          <span className="type-body-small text-text-secondary">
            {children}
          </span>
        )}
      </Comp>
    );
  }
);
EmptyState.displayName = "EmptyState";

export { EmptyState, emptyStateVariants };
