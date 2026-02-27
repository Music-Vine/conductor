/**
 * Entity types that appear in the system-wide activity feed.
 */
export type ActivityEntityType = 'asset' | 'user' | 'contributor' | 'payee'

/**
 * A single entry in the system-wide activity feed.
 * Covers changes made by staff across all entity types.
 *
 * Note: Staff logins and bulk operation events are excluded.
 */
export interface SystemActivityEntry {
  /** Unique identifier for this activity entry */
  id: string
  /** The type of entity this activity relates to */
  entityType: ActivityEntityType
  /** The ID of the specific entity (e.g. "asset-42", "user-7") */
  entityId: string
  /** Human-readable name for the entity */
  entityName: string
  /** The action performed (e.g. "Approved", "Rejected", "Rate changed") */
  action: string
  /** The staff member who performed the action */
  actorId: string
  /** Human-readable name of the staff member */
  actorName: string
  /** Additional detail about the action */
  details: string
  /** ISO 8601 timestamp of when the action occurred */
  createdAt: string
}
