import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

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
    const generatedId = React.useId().replaceAll(":", "");
    const childProps = React.isValidElement(children) ? children.props : {};
    const id = childProps.id || `ff-${generatedId}`;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const describedBy = [
      childProps["aria-describedby"],
      hint ? hintId : undefined,
      error ? errorId : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    // Clone the child input to inject id and aria attributes
    const input = React.isValidElement(children)
      ? React.cloneElement(children, {
          id,
          required: childProps.required ?? required,
          "aria-invalid": error ? true : childProps["aria-invalid"],
          "aria-describedby": describedBy,
          "aria-errormessage": error
            ? errorId
            : childProps["aria-errormessage"],
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
        {hint && (
          <p id={hintId} className="text-base leading-6 text-text-muted md:text-sm md:leading-5">
            {hint}
          </p>
        )}
        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-base font-medium leading-6 text-status-error md:text-sm md:leading-5"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";

export { FormField };
