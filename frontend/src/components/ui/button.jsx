import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control text-[length:var(--type-button-size)] leading-[var(--type-button-leading)] font-semibold transition-[background-color,border-color,color,box-shadow,opacity] duration-fast ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page disabled:pointer-events-none disabled:bg-disabled-surface disabled:text-text-disabled disabled:shadow-none data-[disabled=true]:pointer-events-none data-[disabled=true]:bg-disabled-surface data-[disabled=true]:text-text-disabled data-[disabled=true]:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-action-primary text-white shadow-sm hover:bg-action-primary-hover active:bg-action-primary-active",
        secondary:
          "bg-surface-muted text-text-secondary hover:bg-surface-highlight hover:text-text-primary",
        outline:
          "border border-border-control bg-surface-default text-text-primary hover:border-action-primary hover:bg-surface-muted",
        ghost:
          "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        success:
          "bg-status-success text-white shadow-sm hover:bg-status-success/90",
        link:
          "text-action-primary underline-offset-4 hover:underline data-[disabled=true]:bg-transparent",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-11 rounded-control px-3 text-sm sm:h-8 sm:text-xs",
        lg: "h-12 px-7 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const unavailable = disabled || loading
    const blockUnavailable = (event) => {
      event.preventDefault()
      event.stopPropagation()
    }
    const handleClick = (event) => {
      if (unavailable) {
        blockUnavailable(event)
        return
      }

      onClick?.(event)
    }
    
    return (
      <Comp
        {...props}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={asChild ? undefined : unavailable}
        aria-disabled={asChild && unavailable ? true : undefined}
        aria-busy={loading ? true : undefined}
        data-disabled={unavailable ? "true" : undefined}
        data-state={loading ? "loading" : unavailable ? "disabled" : "ready"}
        tabIndex={asChild && unavailable ? -1 : props.tabIndex}
        onClickCapture={unavailable ? blockUnavailable : undefined}
        onClick={handleClick}
      >
        {loading ? (
          <>
            <Loader2 aria-hidden="true" className="motion-safe:animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
