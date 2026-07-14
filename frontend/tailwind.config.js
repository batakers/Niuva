/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-family-sans)"],
        body: ["var(--font-family-sans)"],
        mono: ["var(--font-family-mono)"],
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
        'brand-primary': 'var(--color-brand-primary)',
        'brand-secondary': 'var(--color-brand-secondary)',
        'action-primary': 'var(--color-action-primary)',
        'action-primary-hover': 'var(--color-action-primary-hover)',
        'surface-page': 'var(--color-surface-page)',
        'surface-default': 'var(--color-surface-default)',
        'surface-muted': 'var(--color-surface-muted)',
        'surface-highlight': 'var(--color-surface-highlight)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-disabled': 'var(--color-text-disabled)',
        'text-inverse': 'var(--color-text-inverse)',
        'border-default': 'var(--color-border-default)',
        'border-strong': 'var(--color-border-strong)',
        'focus-ring': 'var(--color-focus-ring)',
        'navigation-backdrop': 'var(--color-navigation-backdrop)',
        'decoration-brand-soft': 'var(--color-decoration-brand-soft)',
        'decoration-brand-line': 'var(--color-decoration-brand-line)',
        'decoration-brand-strong': 'var(--color-decoration-brand-strong)',
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
          success: 'hsl(var(--success))',
          warning: 'hsl(var(--warning))',
          error: 'hsl(var(--error))',
          info: 'hsl(var(--info))',
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
        fast: 'var(--motion-fast)',
        standard: 'var(--motion-standard)',
        emphasis: 'var(--motion-emphasis)',
      },
      transitionTimingFunction: {
        'snap': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'reveal': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
};
