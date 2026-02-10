import { NextRequest, NextResponse } from 'next/server'
import { musicTransitions, simpleTransitions, getNextState } from '@/lib/workflow/transitions'
import type { Asset, ChecklistItem } from '@/types'

// Import the getAsset helper
async function getAsset(id: string): Promise<Asset | null> {
  try {
    const response = await fetch(`http://localhost:3000/api/assets/${id}`, {
      cache: 'no-store',
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.data as Asset
  } catch {
    return null
  }
}

/**
 * POST /api/assets/[id]/reject - Reject asset at current workflow stage
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100))

  const { id } = await params
  const asset = await getAsset(id)

  if (!asset) {
    return NextResponse.json(
      { error: 'Asset not found' },
      { status: 404 }
    )
  }

  try {
    const body = await request.json()
    const { checklist, comments } = body as {
      checklist?: ChecklistItem[]
      comments: string
    }

    // Comments required for rejection
    if (!comments || comments.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Comments are required when rejecting an asset',
          code: 'COMMENTS_REQUIRED',
        },
        { status: 400 }
      )
    }

    // Get the appropriate transitions for this asset type
    const transitions = asset.type === 'music' ? musicTransitions : simpleTransitions
    const nextState = getNextState(asset.status, 'reject', transitions)

    if (!nextState) {
      return NextResponse.json(
        {
          error: 'Cannot reject asset in current state',
          code: 'INVALID_TRANSITION',
          details: { currentState: asset.status, action: 'reject' },
        },
        { status: 400 }
      )
    }

    // Update asset with rejected state
    const updatedAsset: Asset = {
      ...asset,
      status: nextState as any,
      updatedAt: new Date().toISOString(),
    }

    // Log mock audit entry
    console.log(`[AUDIT] Asset ${id} rejected:`, {
      fromState: asset.status,
      toState: nextState,
      checklist,
      comments,
    })

    return NextResponse.json({ data: updatedAsset })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
