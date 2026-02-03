import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { Platform, PlatformConfig } from '@/types'
import { PLATFORM_CONFIG } from '@/types/platform'

/**
 * Platform atom with localStorage persistence.
 * Defaults to 'music-vine' if no stored value.
 */
export const platformAtom = atomWithStorage<Platform>('conductor_platform', 'music-vine')

/**
 * Derived atom for current platform configuration.
 */
export const platformConfigAtom = atom((get) => {
  const platform = get(platformAtom)
  return PLATFORM_CONFIG[platform]
})

/**
 * Derived atom for theme colors based on platform.
 */
export const platformThemeAtom = atom((get) => {
  const config = get(platformConfigAtom)
  return config.theme
})

/**
 * Derived atom for API base URL.
 */
export const platformApiBaseAtom = atom((get) => {
  const config = get(platformConfigAtom)
  return config.apiBase
})
