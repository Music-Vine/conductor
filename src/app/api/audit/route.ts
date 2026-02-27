import { NextRequest, NextResponse } from 'next/server'
import type { AuditEvent } from '@/types'
import { proxyToBackend } from '@/lib/api/proxy'

/**
 * Mock audit API endpoint.
 *
 * In production, this would be handled by the .NET backend.
 * For frontend development, we log events to console and
 * store them in memory for inspection.
 */

// In-memory store for development (reset on server restart)
const auditEvents: AuditEvent[] = []

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const result = await proxyToBackend(request, '/admin/audit', { method: 'POST', body })
  if (result !== null) {
    if (result instanceof NextResponse) return result
    return NextResponse.json(result.data)
  }

  try {
    const event = body as AuditEvent

    // Validate required fields
    if (!event.actor || !event.action || !event.resource || !event.platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Add ID and ensure timestamp
    const storedEvent: AuditEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: event.timestamp || Date.now(),
    }

    // Store in memory
    auditEvents.unshift(storedEvent)

    // Keep only last 1000 events in memory
    if (auditEvents.length > 1000) {
      auditEvents.pop()
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== AUDIT EVENT ===')
      console.log(`Actor: ${storedEvent.actor}`)
      console.log(`Action: ${storedEvent.action}`)
      console.log(`Resource: ${storedEvent.resource}`)
      console.log(`Platform: ${storedEvent.platform}`)
      console.log(`Time: ${new Date(storedEvent.timestamp).toISOString()}`)
      if (storedEvent.metadata.changes) {
        console.log('Changes:', storedEvent.metadata.changes)
      }
      console.log('===================\n')
    }

    return NextResponse.json({ success: true, id: storedEvent.id })
  } catch (error) {
    console.error('Error processing audit event:', error)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

export async function GET(request: NextRequest) {
  const result = await proxyToBackend(request, '/admin/audit')
  if (result !== null) {
    if (result instanceof NextResponse) return result
    // TODO: adapt response shape when real backend format is known
    return NextResponse.json(result.data)
  }

  // Simple list endpoint for development inspection
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const action = searchParams.get('action')
  const actor = searchParams.get('actor')
  const resource = searchParams.get('resource')

  let filtered = auditEvents

  if (action) {
    filtered = filtered.filter((e) => e.action === action)
  }
  if (actor) {
    filtered = filtered.filter((e) => e.actor === actor)
  }
  if (resource) {
    filtered = filtered.filter((e) => e.resource.includes(resource))
  }

  return NextResponse.json({
    data: filtered.slice(0, limit),
    total: filtered.length,
  })
}
