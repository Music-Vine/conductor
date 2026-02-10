import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/assets/check-duplicates
 *
 * Checks if a file hash already exists in the asset database.
 * Used for pre-upload duplicate detection to prevent re-uploading existing files.
 *
 * Request body:
 * - hash: string - SHA-256 hash of the file (hex string from Web Crypto API)
 * - filename: string - Original filename (for logging/context)
 *
 * Response:
 * - isDuplicate: boolean - Whether the file already exists
 * - existingAssetId?: string - ID of existing asset if duplicate
 * - existingAssetTitle?: string - Title of existing asset if duplicate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hash, filename } = body

    // Validate required fields
    if (!hash || !filename) {
      return NextResponse.json(
        { error: 'Missing required fields: hash, filename' },
        { status: 400 }
      )
    }

    // Validate hash format (SHA-256 produces 64 character hex string)
    if (!/^[a-f0-9]{64}$/i.test(hash)) {
      return NextResponse.json(
        { error: 'Invalid hash format. Expected 64-character hex string (SHA-256)' },
        { status: 400 }
      )
    }

    // Simulate database lookup latency (100-200ms)
    const latency = 100 + Math.random() * 100
    await new Promise((resolve) => setTimeout(resolve, latency))

    // Mock duplicate detection logic:
    // For testing, treat hashes ending in "0000" as duplicates
    const isDuplicate = hash.endsWith('0000')

    console.log('[Mock DB] Duplicate check:', {
      filename,
      hash: hash.slice(0, 12) + '...',
      isDuplicate,
    })

    if (isDuplicate) {
      // Return mock existing asset details
      return NextResponse.json({
        isDuplicate: true,
        existingAssetId: `asset-${hash.slice(0, 8)}`,
        existingAssetTitle: `Existing Asset - ${filename}`,
      })
    }

    return NextResponse.json({
      isDuplicate: false,
    })
  } catch (error) {
    console.error('[Mock DB] Duplicate check error:', error)
    return NextResponse.json(
      { error: 'Failed to check for duplicates' },
      { status: 500 }
    )
  }
}
