import type { Config } from 'tailwindcss'
import cadenceConfig from '@music-vine/cadence/tailwind.config'

/**
 * Tailwind CSS configuration extending Cadence Design System.
 *
 * Cadence provides:
 * - Custom color palette (pink, gray, etc.)
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
  // Extend Cadence theme with project-specific tokens
  theme: {
    extend: {
      // Platform theming CSS variables (defined in globals.css)
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
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
