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
 * POST /api/assets/multipart/create
 *
 * Initiates a multipart upload session for large files (>= 100MB).
 * Conditionally proxies to real backend when NEXT_PUBLIC_USE_REAL_API=true.
 *
 * Request body:
 * - filename: string - Name of the file to upload
 * - contentType: string - MIME type of the file
 *
 * Response:
 * - uploadId: string - Upload session identifier
 * - key: string - S3 object key for the file
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = await proxyToBackend(request, '/admin/assets/multipart/create', {
      method: 'POST',
      body,
    })
    if (result !== null) {
      if (result instanceof NextResponse) return result
      // TODO: adapt response shape when real backend format is known
      return NextResponse.json(result.data)
    }

    const { filename, contentType } = body

    // Validate required fields
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: filename, contentType' },
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

    // Generate mock upload ID and S3 key
    const uploadId = `mock-upload-${crypto.randomUUID()}`
    const key = `uploads/${crypto.randomUUID()}/${filename}`

    // Simulate network latency (50ms)
    await new Promise((resolve) => setTimeout(resolve, 50))

    console.log('[Mock S3] Multipart create:', { key, uploadId, contentType })

    return NextResponse.json({
      uploadId,
      key,
    })
  } catch (error) {
    console.error('[Mock S3] Multipart create error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate multipart upload' },
      { status: 500 }
    )
  }
}
