import { NextRequest, NextResponse } from 'next/server'
import { proxyToBackend } from '@/lib/api/proxy'

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

    const result = await proxyToBackend(request, `/admin/users/${userId}/disconnect-oauth`, { method: 'POST', body })
    if (result !== null) {
      if (result instanceof NextResponse) return result
      // TODO: adapt response shape when real backend format is known
      return NextResponse.json(result.data)
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // TODO: Add audit logging when session context is available
    // In production, this would log: action='user.updated', resource='user:{userId}',
    // metadata={ oauthDisconnect: provider }

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
