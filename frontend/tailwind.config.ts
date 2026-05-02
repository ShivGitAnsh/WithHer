import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
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
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          border: 'hsl(var(--sidebar-border))'
        },
        roseMist: 'hsl(var(--rose-mist) / <alpha-value>)',
        roseCloud: 'hsl(var(--rose-cloud) / <alpha-value>)',
        petal: 'hsl(var(--petal) / <alpha-value>)',
        blush: 'hsl(var(--blush) / <alpha-value>)',
        cocoa: 'hsl(var(--cocoa) / <alpha-value>)',
        plumInk: 'hsl(var(--plum-ink) / <alpha-value>)',
        sage: 'hsl(var(--sage) / <alpha-value>)',
        coralGlow: 'hsl(var(--coral-glow) / <alpha-value>)',
        mmtBlue: 'hsl(var(--mmt-blue) / <alpha-value>)',
        mmtBlueDeep: 'hsl(var(--mmt-blue-deep) / <alpha-value>)',
        mmtCyan: 'hsl(var(--mmt-cyan) / <alpha-value>)',
        mmtOrange: 'hsl(var(--mmt-orange) / <alpha-value>)',
        mmtOrangeSoft: 'hsl(var(--mmt-orange-soft) / <alpha-value>)',
        mmtRed: 'hsl(var(--mmt-red) / <alpha-value>)',
        mmtYellow: 'hsl(var(--mmt-yellow) / <alpha-value>)'
      },
      boxShadow: {
        panel: 'var(--shadow-panel)',
        float: 'var(--shadow-float)',
        cta: 'var(--shadow-cta)'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      },
      fontFamily: {
        sans: [
          'Poppins',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif'
        ],
        serif: ['ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'serif']
      },
      backgroundImage: {}
    }
  },
  plugins: []
} satisfies Config;
