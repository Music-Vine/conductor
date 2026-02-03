'use client'

import { useAtom } from 'jotai'
import { platformAtom } from '@/atoms'
import type { Platform } from '@/types'

interface PlatformToggleProps {
  className?: string
  userId?: string // Optional - when provided, platform switches are audit logged
}

/**
 * iOS-style segmented control for switching between Music Vine and Uppbeat.
 * Per CONTEXT.md: Located in sidebar, clear visual toggle, preserves current page.
 * Per CONTEXT.md: All staff actions are logged - platform switching is an audited action.
 */
export function PlatformToggle({ className = '', userId }: PlatformToggleProps) {
  const [platform, setPlatform] = useAtom(platformAtom)

  const handleSwitch = (newPlatform: Platform) => {
    if (newPlatform !== platform) {
      const previousPlatform = platform
      setPlatform(newPlatform)

      // Audit log platform switch per CONTEXT.md (all staff actions logged)
      // Fire-and-forget - uses captureAuditEvent from lib/audit
      if (userId) {
        import('@/lib/audit')
          .then(({ captureAuditEvent }) => {
            captureAuditEvent({
              actor: userId,
              action: 'platform.switched',
              resource: `platform:${newPlatform}`,
              platform: newPlatform,
              metadata: {
                before: { platform: previousPlatform },
                after: { platform: newPlatform },
              },
            })
          })
          .catch((error) => {
            // Log audit failures to console - don't throw to avoid breaking toggle
            console.error('Failed to log platform switch:', error)
          })
      }
    }
  }

  return (
    <div
      role="group"
      aria-label="Platform selector"
      className={`
        inline-flex rounded-lg bg-gray-100 p-1
        dark:bg-gray-800
        ${className}
      `}
    >
      <button
        type="button"
        onClick={() => handleSwitch('music-vine')}
        aria-pressed={platform === 'music-vine'}
        className={`
          relative rounded-md px-3 py-1.5 text-sm font-medium grow
          transition-all duration-200 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          ${
            platform === 'music-vine'
              ? 'bg-platform-primary text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
          }
        `}
      >
        Music Vine
      </button>
      <button
        type="button"
        onClick={() => handleSwitch('uppbeat')}
        aria-pressed={platform === 'uppbeat'}
        className={`
          relative rounded-md px-3 py-1.5 text-sm font-medium grow
          transition-all duration-200 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          ${
            platform === 'uppbeat'
              ? 'bg-platform-primary text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
          }
        `}
      >
        Uppbeat
      </button>
    </div>
  )
}