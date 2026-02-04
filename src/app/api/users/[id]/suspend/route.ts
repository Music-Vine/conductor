import { NextRequest, NextResponse } from 'next/server'
import { users } from '@/lib/mock-data/users'

/**
 * POST /api/users/[id]/suspend
 *
 * Suspend a user account.
 * Mock implementation - updates user status to suspended.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params

  // Add artificial latency
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Find user in mock data
  const user = users.find((u) => u.id === userId)

  if (!user) {
    return NextResponse.json(
      { error: 'User not found', code: 'USER_NOT_FOUND' },
      { status: 404 }
    )
  }

  // Log audit action (in real implementation)
  console.log('[AUDIT] USER_SUSPENDED', {
    userId,
    email: user.email,
    timestamp: new Date().toISOString(),
  })

  // Update user status to suspended
  const updatedUser = {
    ...user,
    status: 'suspended' as const,
    suspendedAt: new Date().toISOString(),
  }

  return NextResponse.json({
    success: true,
    user: updatedUser,
  })
}
