import type { Config } from 'tailwindcss'
import cadenceConfig from '@music-vine/cadence/tailwind.config'

/**
 * Tailwind CSS configuration extending Cadence Design System.
 *
 * Cadence provides:
 * - Slate color palette (neutral grays) - aliased as 'gray'
 * - Pink color palette (brand color)
 * - Typography scale with proper letter-spacing
 * - Animation utilities for accordions, fades, etc.
 * - Container queries plugin
 *
 * @see https://music-vine.github.io/uppbeat-frontend/
 */
const config: Config = {
  presets: [cadenceConfig],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@music-vine/cadence/dist/**/*.js',
  ],
  theme: {
    extend: {
      // Platform theming CSS variables (defined in globals.css)
      colors: {
        // Alias gray to Cadence's slate for compatibility
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // App-level CSS variables
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Platform brand colors
        platform: {
          primary: 'var(--platform-primary)',
          accent: 'var(--platform-accent)',
          'primary-foreground': 'var(--platform-primary-foreground)',
        },
      },
    },
  },
}

export default config
