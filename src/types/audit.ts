import type { Platform } from './platform'

export type AuditAction =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.banned'
  | 'user.unbanned'
  | 'session.created'
  | 'session.destroyed'
  | 'platform.switched'
  | 'asset.created'
  | 'asset.updated'
  | 'asset.approved'
  | 'asset.rejected'
  | 'asset.deleted'

export interface AuditEvent {
  id?: string
  actor: string // userId of staff member
  action: AuditAction
  resource: string // Format: "type:id" e.g., "user:123"
  timestamp: number
  platform: Platform
  metadata: {
    before?: Record<string, unknown>
    after?: Record<string, unknown>
    reason?: string
    [key: string]: unknown
  }
}

export interface AuditLogFilters {
  actor?: string
  action?: AuditAction
  resource?: string
  platform?: Platform
  startDate?: number
  endDate?: number
}
