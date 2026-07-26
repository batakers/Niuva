import * as React from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { SurfacePanel } from "@/components/ui/surface-panel";

/**
 * StatCard — status-coded left accent, tabular figure. `hero` spans 2 grid
 * columns to break an otherwise-uniform stat grid.
 */
function StatCard({ label, value, colorClass, accentClass, hero, delay, className }) {
  return (
    <SurfacePanel
      className={cn(
        "reveal border-l-4 p-6 transition-all duration-fast hover:shadow-navigation hover:-translate-y-0.5",
        accentClass,
        hero && "col-span-2",
        className
      )}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <p className="type-label text-text-secondary mb-3">{label}</p>
      <p
        className={cn(
          "font-heading font-bold tabular-nums tracking-tight",
          hero ? "text-5xl" : "text-3xl",
          colorClass
        )}
      >
        {value}
      </p>
    </SurfacePanel>
  );
}
StatCard.displayName = "StatCard";

function StatCardSkeleton({ hero, className }) {
  return (
    <SurfacePanel className={cn("border-l-4 border-l-border-default p-6", hero && "col-span-2", className)}>
      <Skeleton className="h-3 w-24 mb-4" />
      <Skeleton className={hero ? "h-12 w-32" : "h-8 w-16"} />
    </SurfacePanel>
  );
}
StatCardSkeleton.displayName = "StatCardSkeleton";

export { StatCard, StatCardSkeleton };
