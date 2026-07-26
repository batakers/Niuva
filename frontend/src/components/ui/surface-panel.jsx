import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const surfacePanelVariants = cva(
  "rounded-panel border border-border-default bg-surface-default shadow-surface",
  {
    variants: {
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      intent: {
        default: "",
        dashed: "border-dashed bg-surface-page/60",
      },
    },
    defaultVariants: {
      padding: "none",
      intent: "default",
    },
  }
);

const surfacePanelHeaderVariants = cva(
  "border-b border-border-default bg-surface-muted rounded-t-panel",
  {
    variants: {
      padding: {
        sm: "px-4 py-3",
        md: "px-6 py-4",
        lg: "p-5",
      },
    },
    defaultVariants: {
      padding: "md",
    },
  }
);

const SurfacePanel = React.forwardRef(
  ({ className, padding, intent, as: Comp = "div", ...props }, ref) => {
    return (
      <Comp
        ref={ref}
        className={cn(surfacePanelVariants({ padding, intent }), className)}
        {...props}
      />
    );
  }
);
SurfacePanel.displayName = "SurfacePanel";

const SurfacePanelHeader = React.forwardRef(
  ({ className, padding, as: Comp = "div", ...props }, ref) => {
    return (
      <Comp
        ref={ref}
        className={cn(surfacePanelHeaderVariants({ padding }), className)}
        {...props}
      />
    );
  }
);
SurfacePanelHeader.displayName = "SurfacePanelHeader";

export {
  SurfacePanel,
  SurfacePanelHeader,
  surfacePanelVariants,
  surfacePanelHeaderVariants,
};
