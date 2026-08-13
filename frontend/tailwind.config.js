/** @type {import('tailwindcss').Config} */
const withOpacity = (token) => `rgb(var(${token}) / <alpha-value>)`

module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        // Resolve through the display/body roles so surface scopes
        // (.brand-page, .admin-workbench) can rebind them. Both still fall back
        // to --font-family-sans at :root, leaving other surfaces unchanged.
        heading: ["var(--font-family-display)"],
        body: ["var(--font-family-body)"],
        mono: ["var(--font-family-mono)"],
        'nds-display': ["var(--font-family-nds-display)"],
        'nds-body': ["var(--font-family-nds-body)"],
        'nds-ui': ["var(--font-family-nds-ui)"],
        expression: ["var(--font-family-nds-expression)"],
        technical: ["var(--font-family-nds-technical)"],
      },
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        control: 'var(--radius-control)',
        card: 'var(--radius-card)',
        panel: 'var(--radius-panel)',
        feature: 'var(--radius-feature)',
        full: 'var(--radius-full)',
        lg: 'var(--radius-panel)',
        md: 'var(--radius-control)',
        DEFAULT: 'var(--radius)',
      },
      colors: {
        'identity-signature': withOpacity('--color-identity-signature-rgb'),
        'identity-support': withOpacity('--color-identity-support-rgb'),
        'brand-primary': withOpacity('--color-brand-primary-rgb'),
        'brand-secondary': withOpacity('--color-brand-secondary-rgb'),
        'action-primary': withOpacity('--color-action-primary-rgb'),
        'action-primary-hover': withOpacity('--color-action-primary-hover-rgb'),
        'action-primary-active': withOpacity('--color-action-primary-active-rgb'),
        'surface-canvas': withOpacity('--color-surface-canvas-rgb'),
        'surface-page': withOpacity('--color-surface-page-rgb'),
        'surface-default': withOpacity('--color-surface-default-rgb'),
        'surface-muted': withOpacity('--color-surface-muted-rgb'),
        'surface-selected': withOpacity('--color-surface-selected-rgb'),
        'surface-highlight': withOpacity('--color-surface-highlight-rgb'),
        'text-primary': withOpacity('--color-text-primary-rgb'),
        'text-secondary': withOpacity('--color-text-secondary-rgb'),
        'text-muted': withOpacity('--color-text-muted-rgb'),
        'text-disabled': withOpacity('--color-text-disabled-rgb'),
        'text-inverse': withOpacity('--color-text-inverse-rgb'),
        'border-control': withOpacity('--color-border-control-rgb'),
        'border-decorative': withOpacity('--color-border-decorative-rgb'),
        'border-default': withOpacity('--color-border-default-rgb'),
        'border-strong': withOpacity('--color-border-strong-rgb'),
        'focus-ring': withOpacity('--color-focus-ring-rgb'),
        'disabled-surface': withOpacity('--color-disabled-surface-rgb'),
        'navigation-backdrop': 'var(--color-navigation-backdrop)',
        'decoration-brand-soft': 'var(--color-decoration-brand-soft)',
        'decoration-brand-line': 'var(--color-decoration-brand-line)',
        'decoration-brand-strong': 'var(--color-decoration-brand-strong)',
        'decoration-inverse-line': 'var(--color-decoration-inverse-line)',
        'public-canvas': 'var(--public-canvas)',
        'public-evidence': 'var(--public-evidence-surface)',
        'commerce-canvas': 'var(--commerce-canvas)',
        'commerce-summary': 'var(--commerce-summary-surface)',
        'commerce-selected': 'var(--commerce-selected-surface)',
        'account-canvas': 'var(--account-canvas)',
        'account-task': 'var(--account-task-surface)',
        'account-recovery': 'var(--account-recovery-surface)',
        'operations-canvas': 'var(--operations-canvas)',
        'operations-row': 'var(--operations-row-surface)',
        'operations-row-selected': 'var(--operations-row-selected)',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        niuva: {
          // Legacy utility aliases retained for operational compatibility.
          blue: 'var(--color-brand-primary)',
          sky: 'var(--color-brand-secondary)',
          dark: 'var(--color-action-primary)',
          midnight: 'var(--color-text-primary)',
          steel: 'var(--color-text-secondary)',
          smoke: 'var(--color-text-disabled)',
          silver: 'var(--color-border-default)',
          frost: 'var(--color-surface-muted)',
          cloud: 'var(--color-surface-page)',
          white: 'var(--color-surface-default)',
        },
        signal: {
          DEFAULT: 'hsl(var(--signal))',
          hover: 'hsl(var(--signal-hover))',
        },
        warm: 'hsl(var(--warm))',
        surface: {
          1: 'hsl(var(--surface-1))',
          2: 'hsl(var(--surface-2))',
          3: 'hsl(var(--surface-3))',
        },
        status: {
          success: {
            DEFAULT: withOpacity('--color-status-success-rgb'),
            surface: 'var(--color-status-success-surface)',
          },
          warning: {
            DEFAULT: withOpacity('--color-status-warning-rgb'),
            surface: 'var(--color-status-warning-surface)',
          },
          error: {
            DEFAULT: withOpacity('--color-status-error-rgb'),
            surface: 'var(--color-status-error-surface)',
          },
          info: {
            DEFAULT: withOpacity('--color-status-info-rgb'),
            surface: 'var(--color-status-info-surface)',
          },
        },
      },
      boxShadow: {
        none: 'var(--shadow-none)',
        surface: 'var(--shadow-surface)',
        navigation: 'var(--shadow-navigation)',
        overlay: 'var(--shadow-overlay)',
        sm: 'var(--shadow-surface)',
        md: 'var(--shadow-navigation)',
        lg: 'var(--shadow-overlay)',
        glow: 'var(--shadow-focus-ring)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'reveal': {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'snap-in': {
          from: { opacity: '0', transform: 'scale(0.98)' },
          to: { opacity: '1', transform: 'scale(1)' }
        },
      },
      animation: {
        'accordion-down': 'accordion-down var(--motion-standard) ease-out',
        'accordion-up': 'accordion-up var(--motion-standard) ease-out',
        'reveal': 'reveal var(--motion-reveal) var(--ease-reveal) both',
        'snap-in': 'snap-in var(--motion-standard) var(--ease-standard) both',
      },
      transitionDuration: {
        instant: 'var(--motion-instant)',
        fast: 'var(--motion-fast)',
        standard: 'var(--motion-standard)',
        deliberate: 'var(--motion-deliberate)',
        ambient: 'var(--motion-ambient)',
        emphasis: 'var(--motion-emphasis)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
        enter: 'var(--ease-enter)',
        exit: 'var(--ease-exit)',
        'snap': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'reveal': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
};
