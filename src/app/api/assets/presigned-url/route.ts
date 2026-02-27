import { NextRequest, NextResponse } from 'next/server'
import { proxyToBackend } from '@/lib/api/proxy'

/**
 * Allowed file extensions per asset type.
 * Based on CONTEXT.md specifications.
 */
const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  music: ['.mp3', '.wav', '.flac', '.aiff'],
  sfx: ['.mp3', '.wav'],
  'motion-graphics': ['.mp4', '.mov'],
  lut: ['.cube', '.3dl'],
  'stock-footage': ['.mp4', '.mov'],
}

/**
 * Validates if a filename has an allowed extension.
 */
function isValidFileType(filename: string): boolean {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'))
  return Object.values(ALLOWED_FILE_TYPES).some((types) => types.includes(ext))
}

/**
 * POST /api/assets/presigned-url
 *
 * Generates a presigned URL for single-part S3 uploads (< 100MB).
 * Conditionally proxies to real backend when NEXT_PUBLIC_USE_REAL_API=true.
 *
 * Request body:
 * - filename: string - Name of the file to upload
 * - contentType: string - MIME type of the file
 * - size: number - File size in bytes
 *
 * Response:
 * - url: string - S3 presigned URL
 * - key: string - S3 object key for the file
 * - fields: object - Additional form fields (empty for mock)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = await proxyToBackend(request, '/admin/assets/presigned-url', {
      method: 'POST',
      body,
    })
    if (result !== null) {
      if (result instanceof NextResponse) return result
      // TODO: adapt response shape when real backend format is known
      return NextResponse.json(result.data)
    }

    const { filename, contentType, size } = body

    // Validate required fields
    if (!filename || !contentType || typeof size !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: filename, contentType, size' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!isValidFileType(filename)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          details: {
            filename,
            allowedTypes: ALLOWED_FILE_TYPES,
          }
        },
        { status: 400 }
      )
    }

    // Generate mock S3 key with UUID
    const uploadId = crypto.randomUUID()
    const key = `uploads/${uploadId}/${filename}`

    // Simulate network latency (50-100ms)
    const latency = 50 + Math.random() * 50
    await new Promise((resolve) => setTimeout(resolve, latency))

    // Generate mock presigned URL
    const mockUrl = `https://mock-s3-bucket.s3.amazonaws.com/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=MOCK&X-Amz-Date=20260210T000000Z&X-Amz-Expires=3600&X-Amz-Signature=mock-signature-${uploadId}&X-Amz-SignedHeaders=host`

    console.log('[Mock S3] Presigned URL generated:', { key, size, contentType })

    return NextResponse.json({
      url: mockUrl,
      key,
      fields: {},
    })
  } catch (error) {
    console.error('[Mock S3] Presigned URL error:', error)
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 }
    )
  }
}
