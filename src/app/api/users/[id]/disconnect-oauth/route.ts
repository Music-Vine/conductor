import { NextRequest, NextResponse } from 'next/server'
import { createAuditLogger } from '@/lib/audit'

type Params = Promise<{ id: string }>

/**
 * POST /api/users/:id/disconnect-oauth
 * Disconnect an OAuth provider from a user account.
 */
export async function POST(
  request: NextRequest,
  segmentData: { params: Params }
) {
  const params = await segmentData.params
  const userId = params.id

  try {
    // Parse and validate request body
    const body = await request.json()
    const { provider } = body

    // Validate provider
    if (!provider || !['google', 'facebook'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be "google" or "facebook".' },
        { status: 400 }
      )
    }

    // Mock validation: Check if user exists (any non-empty id is valid)
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Log audit action
    const logAudit = await createAuditLogger()
    await logAudit({
      action: 'USER_OAUTH_DISCONNECT',
      userId,
      platform: 'music-vine', // Mock - in production would come from user data
      details: { provider },
    })

    return NextResponse.json({
      success: true,
      message: `${provider} OAuth connection disconnected successfully`,
    })
  } catch (error) {
    console.error('Error disconnecting OAuth:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect OAuth' },
      { status: 500 }
    )
  }
}
