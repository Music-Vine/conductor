import { NextRequest, NextResponse } from 'next/server'
import { proxyToBackend } from '@/lib/api/proxy'

/**
 * POST /api/assets/multipart/sign-part
 *
 * Generates a presigned URL for uploading a specific part of a multipart upload.
 * Called for each chunk of the file (parts 1-10000).
 * Conditionally proxies to real backend when NEXT_PUBLIC_USE_REAL_API=true.
 *
 * Request body:
 * - key: string - S3 object key from create endpoint
 * - uploadId: string - Upload session ID from create endpoint
 * - partNumber: number - Part number (1-10000)
 *
 * Response:
 * - url: string - Presigned URL for this part
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // sign-part uses shorter timeout (5s) — called frequently per chunk
    const result = await proxyToBackend(request, '/admin/assets/multipart/sign-part', {
      method: 'POST',
      body,
      timeout: 5_000,
    })
    if (result !== null) {
      if (result instanceof NextResponse) return result
      // TODO: adapt response shape when real backend format is known
      return NextResponse.json(result.data)
    }

    const { key, uploadId, partNumber } = body

    // Validate required fields
    if (!key || !uploadId || typeof partNumber !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: key, uploadId, partNumber' },
        { status: 400 }
      )
    }

    // Validate part number range (S3 allows 1-10000)
    if (partNumber < 1 || partNumber > 10000) {
      return NextResponse.json(
        { error: 'Part number must be between 1 and 10000' },
        { status: 400 }
      )
    }

    // Simulate network latency (30ms - called frequently)
    await new Promise((resolve) => setTimeout(resolve, 30))

    // Generate mock presigned URL for this part
    const mockUrl = `https://mock-s3-bucket.s3.amazonaws.com/${key}?partNumber=${partNumber}&uploadId=${encodeURIComponent(uploadId)}&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=MOCK&X-Amz-Date=20260210T000000Z&X-Amz-Expires=3600&X-Amz-Signature=mock-signature-part-${partNumber}&X-Amz-SignedHeaders=host`

    console.log('[Mock S3] Multipart sign-part:', { partNumber, uploadId: uploadId.slice(-12) })

    return NextResponse.json({
      url: mockUrl,
    })
  } catch (error) {
    console.error('[Mock S3] Multipart sign-part error:', error)
    return NextResponse.json(
      { error: 'Failed to sign part' },
      { status: 500 }
    )
  }
}
