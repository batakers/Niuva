import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const technicalLabelVariants = cva(
  "font-mono uppercase tracking-widest",
  {
    variants: {
      tone: {
        muted: "text-muted-foreground",
        primary: "text-primary",
        foreground: "text-foreground",
        success: "text-status-success",
        warning: "text-status-warning",
        destructive: "text-destructive",
      },
      size: {
        micro: "text-[9px]",
        xs: "text-[10px]",
        sm: "text-xs",
      },
    },
    defaultVariants: {
      tone: "muted",
      size: "xs",
    },
  }
);

const TechnicalLabel = React.forwardRef(
  ({ className, tone, size, as: Comp = "span", ...props }, ref) => {
    return (
      <Comp
        ref={ref}
        className={cn(technicalLabelVariants({ tone, size }), className)}
        {...props}
      />
    );
  }
);
TechnicalLabel.displayName = "TechnicalLabel";

export { TechnicalLabel, technicalLabelVariants };
