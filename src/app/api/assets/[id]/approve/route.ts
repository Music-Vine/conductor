import { NextRequest, NextResponse } from 'next/server'
import { musicTransitions, simpleTransitions, getNextState } from '@/lib/workflow/transitions'
import type { Asset, MusicWorkflowState, SimpleWorkflowState, ChecklistItem } from '@/types'

// Import the generateMockAsset function pattern
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
 * POST /api/assets/[id]/approve - Approve asset at current workflow stage
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
    const { checklist, comments, platform } = body as {
      checklist?: ChecklistItem[]
      comments?: string
      platform?: 'music-vine' | 'uppbeat' | 'both'
    }

    // Get the appropriate transitions for this asset type
    const transitions = asset.type === 'music' ? musicTransitions : simpleTransitions
    const nextState = getNextState(asset.status, 'approve', transitions)

    if (!nextState) {
      return NextResponse.json(
        {
          error: 'Cannot approve asset in current state',
          code: 'INVALID_TRANSITION',
          details: { currentState: asset.status, action: 'approve' },
        },
        { status: 400 }
      )
    }

    // For music assets in platform_assignment state, require platform selection
    if (asset.type === 'music' && asset.status === 'platform_assignment') {
      if (!platform) {
        return NextResponse.json(
          {
            error: 'Platform selection required for music assets in platform_assignment state',
            code: 'PLATFORM_REQUIRED',
          },
          { status: 400 }
        )
      }

      // Update asset with platform assignment
      const updatedAsset: Asset = {
        ...asset,
        platform,
        status: nextState as MusicWorkflowState,
        updatedAt: new Date().toISOString(),
      }

      if (nextState === 'final_approval') {
        updatedAsset.approvedAt = new Date().toISOString()
      }

      // Log mock audit entry
      console.log(`[AUDIT] Asset ${id} approved:`, {
        fromState: asset.status,
        toState: nextState,
        platform,
        checklist,
        comments,
      })

      return NextResponse.json({ data: updatedAsset })
    }

    // Regular approval (non-platform-assignment)
    const updatedAsset: Asset = {
      ...asset,
      status: nextState as any,
      updatedAt: new Date().toISOString(),
    }

    // Set timestamps based on new state
    if (nextState === 'published') {
      updatedAsset.publishedAt = new Date().toISOString()
      if (!updatedAsset.approvedAt) {
        updatedAsset.approvedAt = new Date().toISOString()
      }
    }

    // Log mock audit entry
    console.log(`[AUDIT] Asset ${id} approved:`, {
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
