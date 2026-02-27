import { NextRequest, NextResponse } from 'next/server'
import { proxyToBackend } from '@/lib/api/proxy'

/**
 * POST /api/assets/multipart/complete
 *
 * Completes a multipart upload by assembling all uploaded parts.
 * Conditionally proxies to real backend when NEXT_PUBLIC_USE_REAL_API=true.
 *
 * Request body:
 * - key: string - S3 object key from create endpoint
 * - uploadId: string - Upload session ID from create endpoint
 * - parts: Array<{ partNumber: number, etag: string }> - All uploaded parts
 *
 * Response:
 * - location: string - Final S3 URL of the completed file
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = await proxyToBackend(request, '/admin/assets/multipart/complete', {
      method: 'POST',
      body,
    })
    if (result !== null) {
      if (result instanceof NextResponse) return result
      // TODO: adapt response shape when real backend format is known
      return NextResponse.json(result.data)
    }

    const { key, uploadId, parts } = body

    // Validate required fields
    if (!key || !uploadId || !Array.isArray(parts)) {
      return NextResponse.json(
        { error: 'Missing required fields: key, uploadId, parts' },
        { status: 400 }
      )
    }

    // Validate parts array is not empty
    if (parts.length === 0) {
      return NextResponse.json(
        { error: 'Parts array cannot be empty' },
        { status: 400 }
      )
    }

    // Validate each part has required fields
    for (const part of parts) {
      if (typeof part.partNumber !== 'number' || !part.etag) {
        return NextResponse.json(
          { error: 'Each part must have partNumber and etag' },
          { status: 400 }
        )
      }
    }

    // Simulate network latency (100ms - assembly takes time)
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Generate final S3 location
    const location = `https://mock-s3-bucket.s3.amazonaws.com/${key}`

    console.log('[Mock S3] Multipart complete:', {
      key,
      uploadId: uploadId.slice(-12),
      partCount: parts.length,
    })

    return NextResponse.json({
      location,
    })
  } catch (error) {
    console.error('[Mock S3] Multipart complete error:', error)
    return NextResponse.json(
      { error: 'Failed to complete multipart upload' },
      { status: 500 }
    )
  }
}
