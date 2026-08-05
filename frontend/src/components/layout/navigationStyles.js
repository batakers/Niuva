export const navigationControlClass =
  "type-navigation inline-flex min-h-11 cursor-pointer items-center justify-center rounded-control px-4 py-2.5 transition-all duration-emphasis ease-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default active:scale-[0.98]";

export const outlineNavigationControlClass = `${navigationControlClass} bg-surface-default text-text-primary ring-1 ring-border-strong hover:bg-surface-muted`;

export const quietNavigationControlClass = `${navigationControlClass} text-text-secondary hover:bg-surface-muted hover:text-text-primary`;
