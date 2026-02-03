export type Platform = 'music-vine' | 'uppbeat'

export interface PlatformConfig {
  name: string
  displayName: string
  apiBase: string
  theme: {
    primary: string
    accent: string
  }
}

export const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  'music-vine': {
    name: 'music-vine',
    displayName: 'Music Vine',
    apiBase: process.env.NEXT_PUBLIC_MV_API_BASE || '/api/mv',
    theme: {
      primary: '#1a1a2e',
      accent: '#16213e',
    },
  },
  'uppbeat': {
    name: 'uppbeat',
    displayName: 'Uppbeat',
    apiBase: process.env.NEXT_PUBLIC_UB_API_BASE || '/api/ub',
    theme: {
      primary: '#0f3460',
      accent: '#533483',
    },
  },
}
