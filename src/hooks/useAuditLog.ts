'use client'

import { useCallback } from 'react'
import { useAtom } from 'jotai'
import { platformAtom } from '@/atoms'
import { captureAuditEvent, createAuditLogger } from '@/lib/audit'
import type { AuditAction } from '@/types'

interface UseAuditLogOptions {
  userId: string
}

/**
 * React hook for audit logging in components.
 *
 * Automatically includes platform context from Jotai atom.
 *
 * @example
 * const { log, logUpdate } = useAuditLog({ userId: session.userId })
 *
 * // Simple log
 * log('user.viewed', `user:${userId}`)
 *
 * // Update with before/after
 * logUpdate('user.updated', `user:${userId}`, oldData, newData)
 */
export function useAuditLog({ userId }: UseAuditLogOptions) {
  const [platform] = useAtom(platformAtom)

  const log = useCallback(
    (
      action: AuditAction,
      resource: string,
      metadata?: Record<string, unknown>
    ) => {
      captureAuditEvent({
        actor: userId,
        action,
        resource,
        platform,
        metadata,
      })
    },
    [userId, platform]
  )

  const logUpdate = useCallback(
    (
      action: AuditAction,
      resource: string,
      before: Record<string, unknown>,
      after: Record<string, unknown>
    ) => {
      const logger = createAuditLogger(userId, platform)
      logger.logUpdate(action, resource, before, after)
    },
    [userId, platform]
  )

  return {
    log,
    logUpdate,
  }
}
