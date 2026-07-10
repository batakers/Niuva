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
        heading: ["var(--brand-font-sans)"],
        body: ["var(--brand-font-sans)"],
        mono: ["var(--brand-font-mono)"],
      },
      borderRadius: {
        lg: 'var(--brand-radius-panel)',
        md: 'var(--brand-radius-control)',
        sm: 'var(--radius)',
        DEFAULT: 'var(--radius)',
      },
      colors: {
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
          blue: '#6692BC',
          sky: '#90AFCD',
          dark: '#4A72A0',
          midnight: '#243241',
          steel: '#5F7285',
          smoke: '#6B7A8D',
          silver: '#D8E6F1',
          frost: '#E8F1F8',
          cloud: '#F8FAFC',
          white: '#FFFFFF',
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
        sm: 'var(--brand-shadow-card)',
        md: 'var(--brand-shadow-nav)',
        lg: 'var(--brand-shadow-dialog)',
        glow: 'var(--brand-focus-ring)',
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
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'reveal': 'reveal 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'snap-in': 'snap-in 0.2s cubic-bezier(0.16,1,0.3,1) both',
      },
      transitionTimingFunction: {
        'snap': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'reveal': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
};
