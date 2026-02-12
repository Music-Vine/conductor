/**
 * Bulk Operation Audit Logging
 *
 * Creates single audit log entry per bulk operation (not per item).
 * Includes operation ID, action type, affected count, and actor.
 */

export interface BulkAuditEntry {
  operationId: string
  action: string
  entityType: 'asset' | 'user'
  affectedIds: string[]
  affectedCount: number
  actorId: string | null // null until auth implemented
  timestamp: string
  status: 'completed' | 'failed'
  errorMessage?: string
  payload?: Record<string, unknown> // Action-specific data (e.g., tag name, collection ID)
}

export interface CreateBulkAuditParams {
  operationId: string
  action: string
  entityType: 'asset' | 'user'
  affectedIds: string[]
  actorId?: string | null
  status: 'completed' | 'failed'
  errorMessage?: string
  payload?: Record<string, unknown>
}

// In-memory storage for mock (replace with database in production)
const auditLog: BulkAuditEntry[] = []

/**
 * Creates a bulk audit entry for a completed or failed operation.
 *
 * @example
 * createBulkAuditEntry({
 *   operationId: '12345',
 *   action: 'approve',
 *   entityType: 'asset',
 *   affectedIds: ['asset-1', 'asset-2', 'asset-3'],
 *   status: 'completed',
 * })
 */
export function createBulkAuditEntry(params: CreateBulkAuditParams): BulkAuditEntry {
  const entry: BulkAuditEntry = {
    operationId: params.operationId,
    action: params.action,
    entityType: params.entityType,
    affectedIds: params.affectedIds,
    affectedCount: params.affectedIds.length,
    actorId: params.actorId ?? null,
    timestamp: new Date().toISOString(),
    status: params.status,
    errorMessage: params.errorMessage,
    payload: params.payload,
  }

  // Store in mock audit log
  auditLog.push(entry)

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Bulk Audit]', JSON.stringify(entry, null, 2))
  }

  return entry
}

/**
 * Gets all bulk audit entries (for testing/debugging).
 */
export function getBulkAuditEntries(): BulkAuditEntry[] {
  return [...auditLog]
}

/**
 * Gets a specific bulk audit entry by operation ID.
 */
export function getBulkAuditEntry(operationId: string): BulkAuditEntry | undefined {
  return auditLog.find(entry => entry.operationId === operationId)
}

/**
 * Formats a bulk audit entry for display in logs or UI.
 *
 * @example
 * formatBulkAuditMessage(entry) // "Bulk approved 15 assets"
 */
export function formatBulkAuditMessage(entry: BulkAuditEntry): string {
  const actionVerb = getActionVerb(entry.action)
  return `Bulk ${actionVerb} ${entry.affectedCount} ${entry.entityType}${entry.affectedCount === 1 ? '' : 's'}`
}

/**
 * Maps action names to past-tense verbs for display.
 */
function getActionVerb(action: string): string {
  const verbs: Record<string, string> = {
    approve: 'approved',
    reject: 'rejected',
    delete: 'deleted',
    archive: 'archived',
    takedown: 'took down',
    'add-tag': 'tagged',
    'remove-tag': 'untagged',
    'add-to-collection': 'added to collection',
    'remove-from-collection': 'removed from collection',
    'set-platform': 'updated platform for',
    suspend: 'suspended',
    unsuspend: 'unsuspended',
  }
  return verbs[action] || action
}
