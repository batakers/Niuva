import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const skeletonVariants = cva(
  "motion-safe:animate-pulse rounded-control bg-surface-muted",
  {
    variants: {
      variant: {
        default: "",
        text: "h-4 w-full",
        heading: "h-6 w-3/4",
        avatar: "rounded-full",
        card: "h-32 w-full rounded-panel",
        button: "h-10 w-24",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
      },
    },
    compoundVariants: [
      { variant: "avatar", size: "sm", class: "h-8 w-8" },
      { variant: "avatar", size: "md", class: "h-10 w-10" },
      { variant: "avatar", size: "lg", class: "h-12 w-12" },
      { variant: "text", size: "sm", class: "h-3" },
      { variant: "text", size: "lg", class: "h-5" },
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const Skeleton = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(skeletonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

/**
 * SkeletonText - Multiple lines of skeleton text
 */
function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? "w-2/3" : "w-full"}
        />
      ))}
    </div>
  );
}
SkeletonText.displayName = "SkeletonText";

/**
 * SkeletonTableRow - A skeleton row for tables
 */
function SkeletonTableRow({ columns = 5, className }) {
  return (
    <tr className={cn("border-b border-border-default", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-2">
          <Skeleton variant="text" className={i === 0 ? "w-3/4" : "w-1/2"} />
        </td>
      ))}
    </tr>
  );
}
SkeletonTableRow.displayName = "SkeletonTableRow";

/**
 * SkeletonCard - A skeleton placeholder for cards
 */
function SkeletonCard({ className }) {
  return (
    <div
      className={cn(
        "rounded-panel border border-border-default bg-surface-default p-6 space-y-4",
        className
      )}
    >
      <Skeleton variant="heading" />
      <SkeletonText lines={2} />
    </div>
  );
}
SkeletonCard.displayName = "SkeletonCard";

export {
  Skeleton,
  SkeletonText,
  SkeletonTableRow,
  SkeletonCard,
  skeletonVariants,
};
