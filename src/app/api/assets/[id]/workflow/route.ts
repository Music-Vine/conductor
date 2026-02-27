import { NextRequest, NextResponse } from 'next/server'
import type { WorkflowHistoryItem, MusicWorkflowState, SimpleWorkflowState } from '@/types'
import { proxyToBackend } from '@/lib/api/proxy'

/**
 * Generate mock workflow history based on asset's current status.
 */
function generateWorkflowHistory(
  assetId: string,
  assetType: 'music' | 'sfx' | 'motion-graphics' | 'lut' | 'stock-footage',
  currentStatus: MusicWorkflowState | SimpleWorkflowState
): WorkflowHistoryItem[] {
  const history: WorkflowHistoryItem[] = []
  const reviewers = ['Alice Admin', 'Bob Manager', 'Carol Reviewer', 'Dave Editor']

  const baseTime = Date.now() - (7 * 24 * 60 * 60 * 1000) // 7 days ago

  if (assetType === 'music') {
    const musicStatus = currentStatus as MusicWorkflowState

    // Draft state has no history
    if (musicStatus === 'draft') return history

    // Submitted - add submission
    history.push({
      id: `history-${assetId}-1`,
      assetId,
      reviewerId: 'contributor-1',
      reviewerName: 'Contributor',
      action: 'submit',
      fromState: 'draft',
      toState: 'submitted',
      createdAt: new Date(baseTime).toISOString(),
    })

    if (['initial_review', 'quality_check', 'platform_assignment', 'final_approval', 'published', 'rejected_quality', 'rejected_final'].includes(musicStatus)) {
      // Initial review approved
      history.push({
        id: `history-${assetId}-2`,
        assetId,
        reviewerId: 'reviewer-1',
        reviewerName: reviewers[0],
        action: 'approve',
        fromState: 'submitted',
        toState: 'initial_review',
        checklist: [
          { item: 'Audio quality acceptable', checked: true },
          { item: 'Metadata complete', checked: true },
        ],
        createdAt: new Date(baseTime + 24 * 60 * 60 * 1000).toISOString(),
      })
    }

    if (musicStatus === 'rejected_initial') {
      // Initial review rejected
      history.push({
        id: `history-${assetId}-2`,
        assetId,
        reviewerId: 'reviewer-1',
        reviewerName: reviewers[0],
        action: 'reject',
        fromState: 'submitted',
        toState: 'rejected_initial',
        checklist: [
          { item: 'Audio quality acceptable', checked: false },
          { item: 'Metadata complete', checked: true },
        ],
        comments: 'Audio quality does not meet our standards. Please re-record.',
        createdAt: new Date(baseTime + 24 * 60 * 60 * 1000).toISOString(),
      })
    }

    if (['quality_check', 'platform_assignment', 'final_approval', 'published', 'rejected_quality', 'rejected_final'].includes(musicStatus)) {
      // Quality check approved
      history.push({
        id: `history-${assetId}-3`,
        assetId,
        reviewerId: 'reviewer-2',
        reviewerName: reviewers[1],
        action: 'approve',
        fromState: 'initial_review',
        toState: 'quality_check',
        checklist: [
          { item: 'Professional mixing', checked: true },
          { item: 'No audio artifacts', checked: true },
          { item: 'Appropriate levels', checked: true },
        ],
        createdAt: new Date(baseTime + 48 * 60 * 60 * 1000).toISOString(),
      })
    }

    if (musicStatus === 'rejected_quality') {
      // Quality check rejected
      history.push({
        id: `history-${assetId}-3`,
        assetId,
        reviewerId: 'reviewer-2',
        reviewerName: reviewers[1],
        action: 'reject',
        fromState: 'initial_review',
        toState: 'rejected_quality',
        checklist: [
          { item: 'Professional mixing', checked: false },
          { item: 'No audio artifacts', checked: true },
          { item: 'Appropriate levels', checked: true },
        ],
        comments: 'Mixing needs improvement. Bass is too loud.',
        createdAt: new Date(baseTime + 48 * 60 * 60 * 1000).toISOString(),
      })
    }

    if (['platform_assignment', 'final_approval', 'published', 'rejected_final'].includes(musicStatus)) {
      // Platform assignment
      history.push({
        id: `history-${assetId}-4`,
        assetId,
        reviewerId: 'reviewer-3',
        reviewerName: reviewers[2],
        action: 'approve',
        fromState: 'quality_check',
        toState: 'platform_assignment',
        comments: 'Ready for platform assignment',
        createdAt: new Date(baseTime + 60 * 60 * 60 * 1000).toISOString(),
      })
    }

    if (['final_approval', 'published', 'rejected_final'].includes(musicStatus)) {
      // Final approval stage started
      history.push({
        id: `history-${assetId}-5`,
        assetId,
        reviewerId: 'reviewer-4',
        reviewerName: reviewers[3],
        action: 'approve',
        fromState: 'platform_assignment',
        toState: 'final_approval',
        comments: 'Platform assigned: both',
        createdAt: new Date(baseTime + 72 * 60 * 60 * 1000).toISOString(),
      })
    }

    if (musicStatus === 'rejected_final') {
      // Final approval rejected
      history.push({
        id: `history-${assetId}-6`,
        assetId,
        reviewerId: 'reviewer-4',
        reviewerName: reviewers[3],
        action: 'reject',
        fromState: 'final_approval',
        toState: 'rejected_final',
        comments: 'Genre categorization incorrect. Please update.',
        createdAt: new Date(baseTime + 84 * 60 * 60 * 1000).toISOString(),
      })
    }

    if (musicStatus === 'published') {
      // Published
      history.push({
        id: `history-${assetId}-6`,
        assetId,
        reviewerId: 'reviewer-4',
        reviewerName: reviewers[3],
        action: 'approve',
        fromState: 'final_approval',
        toState: 'published',
        checklist: [
          { item: 'All metadata correct', checked: true },
          { item: 'Platform assignment confirmed', checked: true },
          { item: 'Ready for publication', checked: true },
        ],
        createdAt: new Date(baseTime + 84 * 60 * 60 * 1000).toISOString(),
      })
    }
  } else {
    // Simple workflow (SFX, motion graphics, LUTs, stock footage)
    const simpleStatus = currentStatus as SimpleWorkflowState

    if (simpleStatus === 'draft') return history

    // Submitted
    history.push({
      id: `history-${assetId}-1`,
      assetId,
      reviewerId: 'contributor-1',
      reviewerName: 'Contributor',
      action: 'submit',
      fromState: 'draft',
      toState: 'submitted',
      createdAt: new Date(baseTime).toISOString(),
    })

    if (['review', 'published', 'rejected'].includes(simpleStatus)) {
      // Move to review
      history.push({
        id: `history-${assetId}-2`,
        assetId,
        reviewerId: 'reviewer-1',
        reviewerName: reviewers[0],
        action: 'approve',
        fromState: 'submitted',
        toState: 'review',
        checklist: [
          { item: 'Quality acceptable', checked: true },
          { item: 'Metadata complete', checked: true },
        ],
        createdAt: new Date(baseTime + 24 * 60 * 60 * 1000).toISOString(),
      })
    }

    if (simpleStatus === 'rejected') {
      // Rejected
      history.push({
        id: `history-${assetId}-3`,
        assetId,
        reviewerId: 'reviewer-1',
        reviewerName: reviewers[0],
        action: 'reject',
        fromState: 'review',
        toState: 'rejected',
        checklist: [
          { item: 'Quality acceptable', checked: false },
          { item: 'Metadata complete', checked: true },
        ],
        comments: 'Quality does not meet standards. Please resubmit.',
        createdAt: new Date(baseTime + 48 * 60 * 60 * 1000).toISOString(),
      })
    }

    if (simpleStatus === 'published') {
      // Published
      history.push({
        id: `history-${assetId}-3`,
        assetId,
        reviewerId: 'reviewer-2',
        reviewerName: reviewers[1],
        action: 'approve',
        fromState: 'review',
        toState: 'published',
        checklist: [
          { item: 'Quality verified', checked: true },
          { item: 'Ready for publication', checked: true },
        ],
        createdAt: new Date(baseTime + 48 * 60 * 60 * 1000).toISOString(),
      })
    }
  }

  return history
}

/**
 * GET /api/assets/[id]/workflow - Get workflow history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const result = await proxyToBackend(request, `/admin/assets/${id}/workflow`)
  if (result !== null) {
    if (result instanceof NextResponse) return result
    // TODO: adapt response shape when real backend format is known
    return NextResponse.json(result.data)
  }

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100))

  // Parse asset ID to determine type
  const match = id.match(/^asset-(\d+)$/)
  if (!match) {
    return NextResponse.json(
      { error: 'Asset not found' },
      { status: 404 }
    )
  }

  const assetNum = parseInt(match[1], 10)
  let type: 'music' | 'sfx' | 'motion-graphics' | 'lut' | 'stock-footage'
  if (assetNum <= 300) type = 'music'
  else if (assetNum <= 380) type = 'sfx'
  else if (assetNum <= 430) type = 'motion-graphics'
  else if (assetNum <= 460) type = 'lut'
  else if (assetNum <= 500) type = 'stock-footage'
  else {
    return NextResponse.json(
      { error: 'Asset not found' },
      { status: 404 }
    )
  }

  // Determine current status (same logic as asset detail)
  let status: MusicWorkflowState | SimpleWorkflowState
  if (type === 'music') {
    const rand = (assetNum * 7) % 100
    if (rand < 40) status = 'published'
    else if (rand < 60) status = 'submitted'
    else if (rand < 70) status = 'initial_review'
    else if (rand < 80) status = 'quality_check'
    else if (rand < 85) status = 'draft'
    else if (rand < 90) status = 'platform_assignment'
    else if (rand < 95) status = 'final_approval'
    else status = assetNum % 3 === 0 ? 'rejected_initial' : assetNum % 3 === 1 ? 'rejected_quality' : 'rejected_final'
  } else {
    const rand = (assetNum * 7) % 100
    if (rand < 40) status = 'published'
    else if (rand < 60) status = 'submitted'
    else if (rand < 80) status = 'review'
    else if (rand < 90) status = 'draft'
    else status = 'rejected'
  }

  const history = generateWorkflowHistory(id, type, status)

  return NextResponse.json({ data: history })
}
