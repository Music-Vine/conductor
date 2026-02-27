import { NextRequest, NextResponse } from 'next/server'
import { proxyToBackend } from '@/lib/api/proxy'

/**
 * POST /api/users/[id]/suspend
 *
 * Suspend a user account.
 * Mock implementation - returns success response.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params
  const body = await request.json().catch(() => ({}))

  const result = await proxyToBackend(request, `/admin/users/${userId}/suspend`, { method: 'POST', body })
  if (result !== null) {
    if (result instanceof NextResponse) return result
    // TODO: adapt response shape when real backend format is known
    return NextResponse.json(result.data)
  }

  // Add artificial latency
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Log audit action (mock)
  console.log('[AUDIT] USER_SUSPENDED', {
    userId,
    timestamp: new Date().toISOString(),
  })

  // Mock response - in production this would update the database
  return NextResponse.json({
    success: true,
    user: {
      id: userId,
      status: 'suspended',
      suspendedAt: new Date().toISOString(),
    },
  })
}
