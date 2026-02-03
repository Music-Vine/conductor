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
      // TODO: Enable when audit module is implemented in Plan 07
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
          .catch(() => {
            // Audit module not yet implemented - silent fail
            // Will be available after Plan 01-07 completes
          })
      }
    }
  }

  return (
    <div
      role="group"
      aria-label="Platform selector"
      className={`
        inline-flex rounded-lg bg-zinc-100 p-1
        dark:bg-zinc-800
        ${className}
      `}
    >
      <button
        type="button"
        onClick={() => handleSwitch('music-vine')}
        aria-pressed={platform === 'music-vine'}
        className={`
          relative rounded-md px-3 py-1.5 text-sm font-medium
          transition-all duration-200 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          ${
            platform === 'music-vine'
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }
        `}
      >
        <span className="relative z-10 flex items-center gap-1.5">
          <MusicVineIcon />
          Music Vine
        </span>
      </button>
      <button
        type="button"
        onClick={() => handleSwitch('uppbeat')}
        aria-pressed={platform === 'uppbeat'}
        className={`
          relative rounded-md px-3 py-1.5 text-sm font-medium
          transition-all duration-200 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          ${
            platform === 'uppbeat'
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }
        `}
      >
        <span className="relative z-10 flex items-center gap-1.5">
          <UppbeatIcon />
          Uppbeat
        </span>
      </button>
    </div>
  )
}

// Simple placeholder icons - can be replaced with actual brand icons later
function MusicVineIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  )
}

function UppbeatIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  )
}
