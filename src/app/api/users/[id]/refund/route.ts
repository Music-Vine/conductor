import { NextRequest, NextResponse } from 'next/server'
import { createAuditLogger } from '@/lib/audit'
import type { Platform, SubscriptionTier } from '@/types'

/**
 * Generate minimal user data for refund checks
 */
function getMockUserData(id: string): {
  id: string
  email: string
  platform: Platform
  subscriptionTier: SubscriptionTier
} | null {
  const idNum = parseInt(id.replace('user-', ''), 10)

  if (isNaN(idNum) || idNum < 1 || idNum > 100) {
    return null
  }

  // 40% free, 30% creator, 20% pro, 10% enterprise
  let tier: SubscriptionTier
  const tierMod = idNum % 10
  if (tierMod < 4) tier = 'free'
  else if (tierMod < 7) tier = 'creator'
  else if (tierMod < 9) tier = 'pro'
  else tier = 'enterprise'

  const platforms: Platform[] = ['music-vine', 'uppbeat']
  const platform = platforms[idNum % platforms.length]

  return {
    id,
    email: `user${idNum}@example.com`,
    platform,
    subscriptionTier: tier,
  }
}

/**
 * POST /api/users/[id]/refund
 * Issue refund for user's most recent payment.
 *
 * In production: This calls backend .NET API which handles Stripe payment processing.
 * For now: Mock implementation that returns success response.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params

  // Find user
  const user = getMockUserData(userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Check if user has refundable payments
  if (user.subscriptionTier === 'free') {
    return NextResponse.json(
      { error: 'No refundable payments found for free tier user' },
      { status: 400 }
    )
  }

  // Mock Stripe processing delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Log audit action
  const logAudit = await createAuditLogger()
  await logAudit({
    action: 'USER_REFUND_ISSUED',
    userId: userId,
    platform: user.platform,
    details: {
      tier: user.subscriptionTier,
      email: user.email,
    },
  })

  // TODO: Replace with backend API call for Stripe refund processing
  // Example: POST https://api.conductor.com/users/{userId}/refund
  // The backend will:
  // 1. Retrieve the most recent Stripe payment for this user
  // 2. Issue refund through Stripe API
  // 3. Update subscription status in database
  // 4. Send confirmation email to user
  // 5. Return refund details

  return NextResponse.json({
    success: true,
    message: 'Refund initiated',
    refundId: `ref_${crypto.randomUUID().slice(0, 8)}`,
  })
}
