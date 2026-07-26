import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * ResponsiveTable — table on md+, stacked cards on mobile.
 *
 * Props:
 *   columns: [{ key, header, className, render?(row) }]
 *   data: array of row objects
 *   keyField: string — field to use as React key (default "id")
 *   mobileCard?: (row, index) => ReactNode — custom mobile card
 *   onRowClick?: (row) => void
 *   emptyIcon?: LucideIcon
 *   emptyMessage?: string
 *   loading?: boolean
 *   loadingRows?: number
 *   className?: string
 *   tableClassName?: string
 */
function ResponsiveTable({
  columns = [],
  data = [],
  keyField = "id",
  mobileCard,
  onRowClick,
  emptyIcon,
  emptyMessage = "No data",
  loading,
  loadingRows = 5,
  className,
  tableClassName,
}) {
  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Desktop skeleton */}
        <div className="hidden md:block">
          <SurfacePanel>
            <Table className={tableClassName}>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key} className={col.className}>
                      {col.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: loadingRows }, (_, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SurfacePanel>
        </div>
        {/* Mobile skeleton */}
        <div className="md:hidden space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <SurfacePanel key={i} padding="sm">
              <div className="space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
              </div>
            </SurfacePanel>
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <EmptyState frame="dashed" icon={emptyIcon}>
        {emptyMessage}
      </EmptyState>
    );
  }

  return (
    <div className={cn(className)}>
      {/* Desktop table */}
      <div className="hidden md:block">
        <SurfacePanel>
          <Table className={tableClassName}>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.className}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow
                  key={row[keyField] ?? idx}
                  className={onRowClick ? "cursor-pointer" : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render ? col.render(row, idx) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SurfacePanel>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {data.map((row, idx) =>
          mobileCard ? (
            <React.Fragment key={row[keyField] ?? idx}>
              {mobileCard(row, idx)}
            </React.Fragment>
          ) : (
            <SurfacePanel
              key={row[keyField] ?? idx}
              padding="sm"
              className={cn(
                "transition-colors duration-fast",
                onRowClick && "cursor-pointer hover:bg-surface-muted/50 active:bg-surface-muted"
              )}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {columns.map((col) => (
                  <div key={col.key}>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                      {col.header}
                    </dt>
                    <dd className="mt-0.5 text-text-primary">
                      {col.render ? col.render(row, idx) : row[col.key] ?? "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            </SurfacePanel>
          )
        )}
      </div>
    </div>
  );
}

export { ResponsiveTable };
