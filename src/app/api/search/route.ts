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
  { id: 'asset-1', type: 'asset', title: 'Summer Vibes 1', assetType: 'music', tags: ['upbeat', 'summer', 'pop'], genre: 'Pop', contributor: 'Alex Thompson' },
  { id: 'asset-2', type: 'asset', title: 'Corporate Motivation 1', assetType: 'music', tags: ['corporate', 'business', 'motivational'], genre: 'Corporate', contributor: 'Sarah Johnson' },
  { id: 'asset-3', type: 'asset', title: 'Epic Cinematic 1', assetType: 'music', tags: ['cinematic', 'dramatic', 'orchestral'], genre: 'Cinematic', contributor: 'Michael Chen' },
  { id: 'asset-4', type: 'asset', title: 'Acoustic Dreams 1', assetType: 'music', tags: ['acoustic', 'folk', 'calm'], genre: 'Folk', contributor: 'Emma Wilson' },
  { id: 'asset-5', type: 'asset', title: 'Electronic Pulse 1', assetType: 'music', tags: ['electronic', 'edm', 'energy'], genre: 'Electronic', contributor: 'David Martinez' },
  { id: 'asset-301', type: 'asset', title: 'Button Click 1', assetType: 'sfx', tags: ['ui', 'interface', 'click'], genre: 'UI Sounds', contributor: 'Rachel Kim' },
  { id: 'asset-302', type: 'asset', title: 'Bird Chirping 1', assetType: 'sfx', tags: ['nature', 'birds', 'outdoor'], genre: 'Nature', contributor: 'James Brown' },
  { id: 'asset-381', type: 'asset', title: 'Lower Third 1', assetType: 'motion-graphics', tags: ['text', 'overlay', 'graphic'], genre: 'Motion', contributor: 'Lisa Anderson' },
  { id: 'asset-382', type: 'asset', title: 'Logo Reveal 1', assetType: 'motion-graphics', tags: ['logo', 'animation', 'intro'], genre: 'Motion', contributor: 'Chris Taylor' },
  { id: 'asset-431', type: 'asset', title: 'Cinematic Teal Orange 1', assetType: 'lut', tags: ['color', 'grading', 'cinematic'], genre: 'LUT', contributor: 'Maria Garcia' },
  { id: 'asset-461', type: 'asset', title: 'City Skyline 1', assetType: 'stock-footage', tags: ['city', 'urban', 'aerial'], genre: 'Footage', contributor: 'Kevin White' },
  { id: 'asset-462', type: 'asset', title: 'Ocean Waves 1', assetType: 'stock-footage', tags: ['ocean', 'nature', 'water'], genre: 'Footage', contributor: 'Jennifer Lee' },
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
      subtitle: `${a.assetType} by ${a.contributor}`,
      searchFields: {
        title: a.title,
        tags: a.tags.join(' '),
        contributor: a.contributor,
        genre: a.genre,
        assetType: a.assetType,
      },
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
