import { NextRequest, NextResponse } from 'next/server'
import { proxyToBackend } from '@/lib/api/proxy'
import {
  formatSSEData,
  createSSEHeaders,
  estimateSecondsRemaining,
  generateOperationId,
} from '@/lib/bulk-operations/sse'
import type { ProgressEvent, ErrorEvent, CompleteEvent } from '@/lib/bulk-operations/sse'
import { createBulkAuditEntry } from '@/lib/bulk-operations/audit'

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
 * POST /api/assets/bulk - Execute bulk operations on assets with SSE progress.
 * Conditionally proxies to real backend when NEXT_PUBLIC_USE_REAL_API=true.
 */
export async function POST(request: NextRequest) {
  const body = await request.json()

  const result = await proxyToBackend(request, '/admin/assets/bulk', { method: 'POST', body })
  if (result !== null) {
    if (result instanceof NextResponse) return result
    // TODO: SSE stream forwarding for bulk operations when real backend SSE format is known
    return NextResponse.json(result.data)
  }

  const { action, assetIds, payload }: BulkAssetRequest = body
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

          // Create audit entry for failed operation
          createBulkAuditEntry({
            operationId,
            action,
            entityType: 'asset',
            affectedIds: assetIds.slice(0, i), // Only IDs processed before failure
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            payload,
          })

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

      // Create audit entry for successful operation
      createBulkAuditEntry({
        operationId,
        action,
        entityType: 'asset',
        affectedIds: assetIds,
        status: 'completed',
        payload,
      })

      controller.close()
    },
  })

  return new Response(stream, { headers: createSSEHeaders() })
}
