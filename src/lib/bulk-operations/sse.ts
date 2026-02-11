/**
 * Server-Sent Events (SSE) utilities for bulk operations
 */

export interface ProgressEvent {
  type: 'progress'
  processed: number
  total: number
  percentage: number
  currentItem: string // e.g., "Summer Vibes.mp3" or "john@example.com"
  estimatedSecondsRemaining: number | null
}

export interface ErrorEvent {
  type: 'error'
  message: string
  processed: number
  total: number
  failedItem: string
}

export interface CompleteEvent {
  type: 'complete'
  processed: number
  total: number
  operationId: string // For audit log reference
}

export type SSEEvent = ProgressEvent | ErrorEvent | CompleteEvent

// Create encoder once
const encoder = new TextEncoder()

/**
 * Format SSE data line
 */
export function formatSSEData(event: SSEEvent): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
}

/**
 * Create SSE Response headers
 */
export function createSSEHeaders(): Headers {
  return new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })
}

/**
 * Helper to estimate time remaining based on items processed and elapsed time
 */
export function estimateSecondsRemaining(
  processed: number,
  total: number,
  startTime: number
): number | null {
  if (processed === 0) return null
  const elapsed = (Date.now() - startTime) / 1000
  const rate = processed / elapsed
  const remaining = total - processed
  return Math.round(remaining / rate)
}

/**
 * Generate operation ID for audit
 */
export function generateOperationId(): string {
  return `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
