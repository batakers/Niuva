import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-control border border-border-control bg-surface-default px-3 py-2 text-base text-text-primary shadow-sm transition-[background-color,border-color,box-shadow,color] duration-fast ease-standard file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary placeholder:text-text-muted focus-visible:border-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring aria-invalid:border-status-error aria-invalid:bg-status-error-surface aria-invalid:ring-1 aria-invalid:ring-status-error disabled:cursor-not-allowed disabled:border-border-decorative disabled:bg-disabled-surface disabled:text-text-disabled disabled:shadow-none md:text-sm",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Input.displayName = "Input"

export { Input }
