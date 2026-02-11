import { NextRequest } from 'next/server'
import {
  formatSSEData,
  createSSEHeaders,
  estimateSecondsRemaining,
  generateOperationId,
} from '@/lib/bulk-operations/sse'
import type { ProgressEvent, ErrorEvent, CompleteEvent } from '@/lib/bulk-operations/sse'

/**
 * Bulk actions available for assets
 */
export type BulkAssetAction =
  | 'approve'
  | 'reject'
  | 'delete'
  | 'archive'
  | 'takedown'
  | 'add-tag'
  | 'remove-tag'
  | 'add-to-collection'
  | 'remove-from-collection'
  | 'set-platform'

interface BulkAssetRequest {
  action: BulkAssetAction
  assetIds: string[]
  payload?: {
    tag?: string
    collectionId?: string
    platform?: 'music-vine' | 'uppbeat' | 'both'
    comments?: string
  }
}

/**
 * POST /api/assets/bulk - Execute bulk operations on assets with SSE progress
 */
export async function POST(request: NextRequest) {
  const { action, assetIds, payload }: BulkAssetRequest = await request.json()
  const operationId = generateOperationId()
  const startTime = Date.now()

  const stream = new ReadableStream({
    async start(controller) {
      const total = assetIds.length

      for (let i = 0; i < assetIds.length; i++) {
        const assetId = assetIds[i]

        try {
          // Simulate operation (50-150ms per item)
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100))

          // Simulate random failure (2% chance) for testing error handling
          if (Math.random() < 0.02) {
            throw new Error(`Failed to ${action} asset: permission denied`)
          }

          const processed = i + 1
          const progress: ProgressEvent = {
            type: 'progress',
            processed,
            total,
            percentage: Math.round((processed / total) * 100),
            currentItem: `Asset ${assetId.slice(0, 8)}...`, // Truncated ID as mock name
            estimatedSecondsRemaining: estimateSecondsRemaining(processed, total, startTime),
          }
          controller.enqueue(formatSSEData(progress))
        } catch (error) {
          // Stop on first error per CONTEXT decision
          const errorEvent: ErrorEvent = {
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
            processed: i,
            total,
            failedItem: assetId,
          }
          controller.enqueue(formatSSEData(errorEvent))
          controller.close()
          return
        }
      }

      // Success
      const complete: CompleteEvent = {
        type: 'complete',
        processed: total,
        total,
        operationId,
      }
      controller.enqueue(formatSSEData(complete))
      controller.close()
    },
  })

  return new Response(stream, { headers: createSSEHeaders() })
}
