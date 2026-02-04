import { NextRequest, NextResponse } from 'next/server'

// Mock searchable data - in production this would query the database
const mockUsers = [
  { id: 'u1', type: 'user', email: 'john@example.com', name: 'John Smith', subscription: 'pro' },
  { id: 'u2', type: 'user', email: 'jane@company.org', name: 'Jane Doe', subscription: 'enterprise' },
  { id: 'u3', type: 'user', email: 'bob@startup.io', name: 'Bob Wilson', subscription: 'creator' },
  { id: 'u4', type: 'user', email: 'alice@agency.com', name: 'Alice Brown', subscription: 'pro' },
  { id: 'u5', type: 'user', email: 'charlie@music.co', name: 'Charlie Davis', subscription: 'free' },
]

const mockAssets = [
  { id: 'a1', type: 'asset', title: 'Summer Vibes', tags: ['upbeat', 'summer', 'pop'], contributor: 'John Artist' },
  { id: 'a2', type: 'asset', title: 'Corporate Success', tags: ['corporate', 'business', 'motivational'], contributor: 'Studio Pro' },
  { id: 'a3', type: 'asset', title: 'Cinematic Epic', tags: ['cinematic', 'dramatic', 'orchestral'], contributor: 'Film Composer' },
  { id: 'a4', type: 'asset', title: 'Chill Lofi Beat', tags: ['lofi', 'chill', 'ambient'], contributor: 'Lofi Producer' },
  { id: 'a5', type: 'asset', title: 'Action Trailer', tags: ['action', 'trailer', 'intense'], contributor: 'Trailer Music Co' },
]

const mockPayees = [
  { id: 'p1', type: 'payee', name: 'John Artist', email: 'john@artist.com' },
  { id: 'p2', type: 'payee', name: 'Studio Pro LLC', email: 'billing@studiopro.com' },
  { id: 'p3', type: 'payee', name: 'Film Composer Inc', email: 'accounts@filmcomposer.com' },
  { id: 'p4', type: 'payee', name: 'Lofi Producer', email: 'lofi@producer.net' },
  { id: 'p5', type: 'payee', name: 'Trailer Music Company', email: 'finance@trailermusic.co' },
]

export interface SearchResult {
  id: string
  type: 'user' | 'asset' | 'payee'
  title: string
  subtitle: string
  url: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [], query: '' })
  }

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100))

  // Return all data for client-side fuzzy search
  // In production, this could do server-side search for very large datasets
  const searchableData = {
    users: mockUsers.map(u => ({
      id: u.id,
      type: 'user' as const,
      title: u.name || u.email,
      subtitle: u.email,
      searchFields: { email: u.email, name: u.name, subscription: u.subscription },
      url: `/users/${u.id}`,
    })),
    assets: mockAssets.map(a => ({
      id: a.id,
      type: 'asset' as const,
      title: a.title,
      subtitle: `by ${a.contributor}`,
      searchFields: { title: a.title, tags: a.tags.join(' '), contributor: a.contributor },
      url: `/assets/${a.id}`,
    })),
    payees: mockPayees.map(p => ({
      id: p.id,
      type: 'payee' as const,
      title: p.name,
      subtitle: p.email,
      searchFields: { name: p.name, email: p.email },
      url: `/payees/${p.id}`,
    })),
  }

  return NextResponse.json({ searchableData, query })
}
