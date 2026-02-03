import type { AuditEvent, AuditAction, Platform } from '@/types'

/**
 * Options for capturing an audit event.
 */
export interface CaptureAuditEventOptions {
  actor: string
  action: AuditAction
  resource: string
  platform: Platform
  metadata?: {
    before?: Record<string, unknown>
    after?: Record<string, unknown>
    reason?: string
    [key: string]: unknown
  }
}

/**
 * Captures an audit event and sends it to the backend.
 *
 * This is a fire-and-forget operation - it doesn't await the response
 * to avoid blocking UI operations. Errors are logged but not thrown.
 *
 * @param options - Audit event details
 */
export async function captureAuditEvent(options: CaptureAuditEventOptions): Promise<void> {
  const event: AuditEvent = {
    actor: options.actor,
    action: options.action,
    resource: options.resource,
    platform: options.platform,
    timestamp: Date.now(),
    metadata: options.metadata || {},
  }

  // Fire-and-forget - don't await
  sendAuditEvent(event).catch((error) => {
    console.error('Failed to capture audit event:', error)
  })
}

/**
 * Internal function to send audit event to API.
 */
async function sendAuditEvent(event: AuditEvent): Promise<void> {
  const response = await fetch('/api/audit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Audit API returned ${response.status}`)
  }
}

/**
 * Creates a logger scoped to a specific actor and platform.
 * Useful for components that need to log multiple events.
 */
export function createAuditLogger(actor: string, platform: Platform) {
  return {
    log(
      action: AuditAction,
      resource: string,
      metadata?: CaptureAuditEventOptions['metadata']
    ) {
      return captureAuditEvent({
        actor,
        action,
        resource,
        platform,
        metadata,
      })
    },

    /**
     * Logs an update with before/after state.
     * Automatically calculates changed fields.
     */
    logUpdate(
      action: AuditAction,
      resource: string,
      before: Record<string, unknown>,
      after: Record<string, unknown>
    ) {
      const changes = calculateChanges(before, after)

      return captureAuditEvent({
        actor,
        action,
        resource,
        platform,
        metadata: {
          before,
          after,
          changes, // Summary of what changed
        },
      })
    },
  }
}

/**
 * Calculates a summary of changes between two objects.
 * Returns an array of change descriptions like "email: old@example.com → new@example.com"
 */
function calculateChanges(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): string[] {
  const changes: string[] = []
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)])

  for (const key of allKeys) {
    const beforeValue = before[key]
    const afterValue = after[key]

    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      const beforeStr = formatValue(beforeValue)
      const afterStr = formatValue(afterValue)
      changes.push(`${key}: ${beforeStr} → ${afterStr}`)
    }
  }

  return changes
}

/**
 * Formats a value for display in change summary.
 */
function formatValue(value: unknown): string {
  if (value === undefined) return '(not set)'
  if (value === null) return '(empty)'
  if (typeof value === 'string') return value || '(empty string)'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  if (Array.isArray(value)) return `[${value.length} items]`
  if (typeof value === 'object') return '{...}'
  return String(value)
}
