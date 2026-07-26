import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

let fieldIdCounter = 0;

/**
 * FormField — connects Label to Input via auto-generated id.
 * Displays optional error message with role="alert".
 *
 * Usage:
 *   <FormField label="Email" error={errors.email}>
 *     <Input type="email" />
 *   </FormField>
 */
const FormField = React.forwardRef(
  ({ className, label, hint, error, children, required, ...props }, ref) => {
    const idRef = React.useRef(`ff-${++fieldIdCounter}`);
    const id = idRef.current;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    // Clone the child input to inject id and aria attributes
    const input = React.isValidElement(children)
      ? React.cloneElement(children, {
          id,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": cn(
            error ? errorId : undefined,
            hint ? hintId : undefined
          ) || undefined,
        })
      : children;

    return (
      <div ref={ref} className={cn("space-y-1.5", className)} {...props}>
        {label && (
          <Label htmlFor={id}>
            {label}
            {required && (
              <span className="text-status-error ml-0.5" aria-hidden="true">*</span>
            )}
          </Label>
        )}
        {input}
        {hint && !error && (
          <p id={hintId} className="text-xs text-text-secondary">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-status-error">
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";

export { FormField };
