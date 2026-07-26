import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * ErrorState — replaces silent .catch(() => {}) pattern.
 * Shows error message + retry button.
 *
 * Usage:
 *   <ErrorState error={error} onRetry={() => refetch()} />
 *   <ErrorState error="Failed to load" compact />
 */
const ErrorState = React.forwardRef(
  ({ className, error, onRetry, compact, children, ...props }, ref) => {
    const message =
      typeof error === "string"
        ? error
        : error?.message || "An unexpected error occurred";

    if (compact) {
      return (
        <div
          ref={ref}
          role="alert"
          className={cn(
            "flex items-center gap-2 rounded-control border border-status-error/20 bg-status-error/5 px-3 py-2 text-sm text-status-error",
            className
          )}
          {...props}
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">{message}</span>
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-7 px-2 text-status-error hover:text-status-error"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "flex flex-col items-center gap-3 p-12 text-center",
          className
        )}
        {...props}
      >
        <AlertCircle className="h-8 w-8 text-status-error" strokeWidth={1.5} />
        <div className="space-y-1">
          <p className="type-body-small text-text-primary font-medium">
            {message}
          </p>
          {children && (
            <p className="text-xs text-text-secondary">{children}</p>
          )}
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Retry
          </Button>
        )}
      </div>
    );
  }
);
ErrorState.displayName = "ErrorState";

export { ErrorState };
