import type { AuditEvent } from '@/types'

/**
 * Capture an audit event.
 * TODO: Implementation will be added in plan 01-06
 */
export function captureAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
  // Placeholder - will be implemented in plan 01-06
  console.log('Audit event:', event)
}
