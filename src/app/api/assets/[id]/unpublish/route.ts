import { NextRequest, NextResponse } from 'next/server'
import { musicTransitions, simpleTransitions, getNextState } from '@/lib/workflow/transitions'
import type { Asset } from '@/types'
import { proxyToBackend } from '@/lib/api/proxy'

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
 * POST /api/assets/[id]/unpublish - Unpublish a published asset (takedown)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Read body gracefully — unpublish may or may not include a body
  const body = await request.json().catch(() => ({}))

  const proxyResult = await proxyToBackend(request, `/admin/assets/${id}/unpublish`, {
    method: 'POST',
    body,
  })
  if (proxyResult !== null) {
    if (proxyResult instanceof NextResponse) return proxyResult
    // TODO: adapt response shape when real backend format is known
    return NextResponse.json(proxyResult.data)
  }

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100))

  const asset = await getAsset(id)

  if (!asset) {
    return NextResponse.json(
      { error: 'Asset not found' },
      { status: 404 }
    )
  }

  // Can only unpublish published assets
  if (asset.status !== 'published') {
    return NextResponse.json(
      {
        error: 'Can only unpublish published assets',
        code: 'INVALID_STATE',
        details: { currentState: asset.status },
      },
      { status: 400 }
    )
  }

  // Get the appropriate transitions for this asset type
  const transitions = asset.type === 'music' ? musicTransitions : simpleTransitions
  const nextState = getNextState(asset.status, 'unpublish', transitions)

  if (!nextState) {
    return NextResponse.json(
      {
        error: 'Cannot unpublish asset',
        code: 'INVALID_TRANSITION',
      },
      { status: 400 }
    )
  }

  // Update asset back to draft state
  const updatedAsset: Asset = {
    ...asset,
    status: nextState as any,
    updatedAt: new Date().toISOString(),
  }

  // Clear publication timestamp
  delete updatedAsset.publishedAt

  // Log mock audit entry
  console.log(`[AUDIT] Asset ${id} unpublished:`, {
    fromState: asset.status,
    toState: nextState,
  })

  return NextResponse.json({ data: updatedAsset })
}
