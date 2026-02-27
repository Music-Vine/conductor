import { NextRequest, NextResponse } from 'next/server'
import { proxyToBackend } from '@/lib/api/proxy'

/**
 * POST /api/assets/multipart/abort
 *
 * Aborts a multipart upload session, cleaning up any uploaded parts.
 * Called when user cancels an upload or an error occurs.
 * Conditionally proxies to real backend when NEXT_PUBLIC_USE_REAL_API=true.
 *
 * Request body:
 * - key: string - S3 object key from create endpoint
 * - uploadId: string - Upload session ID from create endpoint
 *
 * Response:
 * - Empty 200 response on success
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = await proxyToBackend(request, '/admin/assets/multipart/abort', {
      method: 'POST',
      body,
    })
    if (result !== null) {
      if (result instanceof NextResponse) return result
      // TODO: adapt response shape when real backend format is known
      return NextResponse.json(result.data)
    }

    const { key, uploadId } = body

    // Validate required fields
    if (!key || !uploadId) {
      return NextResponse.json(
        { error: 'Missing required fields: key, uploadId' },
        { status: 400 }
      )
    }

    // Simulate network latency (50ms)
    await new Promise((resolve) => setTimeout(resolve, 50))

    console.log('[Mock S3] Multipart abort:', {
      key,
      uploadId: uploadId.slice(-12),
    })

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error('[Mock S3] Multipart abort error:', error)
    return NextResponse.json(
      { error: 'Failed to abort multipart upload' },
      { status: 500 }
    )
  }
}
