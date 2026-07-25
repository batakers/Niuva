import { Toaster as Sonner, toast } from "sonner"

const Toaster = ({
  ...props
}) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface-page group-[.toaster]:text-text-primary group-[.toaster]:border-border-default group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-text-secondary",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-text-on-primary",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-text-secondary",
        },
      }}
      {...props} />
  );
}

export { Toaster, toast }
