'use client'

import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import Fuse from 'fuse.js'

export interface SearchResultItem {
  id: string
  type: 'user' | 'asset' | 'payee'
  title: string
  subtitle: string
  url: string
  score?: number
}

interface SearchableItem {
  id: string
  type: 'user' | 'asset' | 'payee'
  title: string
  subtitle: string
  url: string
  searchFields: Record<string, string>
}

interface SearchData {
  users: SearchableItem[]
  assets: SearchableItem[]
  payees: SearchableItem[]
}

// Fetch searchable data (cached for 5 minutes)
async function fetchSearchData(): Promise<SearchData> {
  const response = await fetch('/api/search?q=_prefetch', {
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('Failed to fetch search data')
  }
  const data = await response.json()
  return data.searchableData
}

interface UseGlobalSearchOptions {
  maxResults?: number
  minQueryLength?: number
}

export function useGlobalSearch(
  query: string,
  options: UseGlobalSearchOptions = {}
) {
  const { maxResults = 10, minQueryLength = 2 } = options
  const [isSearching, setIsSearching] = useState(false)

  // Prefetch and cache searchable data
  const { data: searchData, isLoading: isLoadingData } = useQuery({
    queryKey: ['search-data'],
    queryFn: fetchSearchData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Create Fuse instances for each entity type
  const fuseInstances = useMemo(() => {
    if (!searchData) return null

    const fuseOptions = {
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true,
    }

    return {
      users: new Fuse(searchData.users, {
        ...fuseOptions,
        keys: [
          { name: 'searchFields.email', weight: 2 },
          { name: 'searchFields.name', weight: 1.5 },
          { name: 'searchFields.subscription', weight: 1 },
        ],
      }),
      assets: new Fuse(searchData.assets, {
        ...fuseOptions,
        keys: [
          { name: 'searchFields.title', weight: 2 },
          { name: 'searchFields.tags', weight: 1.5 },
          { name: 'searchFields.contributor', weight: 1 },
        ],
      }),
      payees: new Fuse(searchData.payees, {
        ...fuseOptions,
        keys: [
          { name: 'searchFields.name', weight: 2 },
          { name: 'searchFields.email', weight: 1.5 },
        ],
      }),
    }
  }, [searchData])

  // Perform fuzzy search with dynamic result weighting
  const results = useMemo<SearchResultItem[]>(() => {
    if (!fuseInstances || !query || query.length < minQueryLength) {
      return []
    }

    setIsSearching(true)

    // Search all entity types
    const userResults = fuseInstances.users.search(query)
    const assetResults = fuseInstances.assets.search(query)
    const payeeResults = fuseInstances.payees.search(query)

    // Calculate average scores (lower is better in Fuse.js)
    const avgScores = {
      users: userResults.length > 0
        ? userResults.reduce((acc, r) => acc + (r.score || 1), 0) / userResults.length
        : 1,
      assets: assetResults.length > 0
        ? assetResults.reduce((acc, r) => acc + (r.score || 1), 0) / assetResults.length
        : 1,
      payees: payeeResults.length > 0
        ? payeeResults.reduce((acc, r) => acc + (r.score || 1), 0) / payeeResults.length
        : 1,
    }

    // Dynamic allocation: show more of entity types with better matches
    // Sort by best average score (lower is better)
    const sortedTypes = (Object.entries(avgScores) as [keyof typeof avgScores, number][])
      .filter(([type]) => {
        const results = { users: userResults, assets: assetResults, payees: payeeResults }
        return results[type].length > 0
      })
      .sort(([, a], [, b]) => a - b)
      .map(([type]) => type)

    // Allocate: 60% to best, 30% to second, 10% to third
    const allocations: Record<string, number> = { users: 0, assets: 0, payees: 0 }
    if (sortedTypes.length > 0) allocations[sortedTypes[0]] = Math.ceil(maxResults * 0.6)
    if (sortedTypes.length > 1) allocations[sortedTypes[1]] = Math.ceil(maxResults * 0.3)
    if (sortedTypes.length > 2) allocations[sortedTypes[2]] = Math.ceil(maxResults * 0.1)

    // Combine results
    const combined: SearchResultItem[] = [
      ...userResults.slice(0, allocations.users).map(r => ({
        ...r.item,
        score: r.score,
      })),
      ...assetResults.slice(0, allocations.assets).map(r => ({
        ...r.item,
        score: r.score,
      })),
      ...payeeResults.slice(0, allocations.payees).map(r => ({
        ...r.item,
        score: r.score,
      })),
    ].sort((a, b) => (a.score || 0) - (b.score || 0))

    setIsSearching(false)
    return combined.slice(0, maxResults)
  }, [fuseInstances, query, minQueryLength, maxResults])

  // Manual search function for imperative use
  const search = useCallback((searchQuery: string): SearchResultItem[] => {
    if (!fuseInstances || searchQuery.length < minQueryLength) {
      return []
    }

    const allResults = [
      ...fuseInstances.users.search(searchQuery),
      ...fuseInstances.assets.search(searchQuery),
      ...fuseInstances.payees.search(searchQuery),
    ]
      .map(r => ({ ...r.item, score: r.score }))
      .sort((a, b) => (a.score || 0) - (b.score || 0))

    return allResults.slice(0, maxResults)
  }, [fuseInstances, minQueryLength, maxResults])

  return {
    results,
    isLoading: isLoadingData,
    isSearching,
    search,
    hasData: !!searchData,
  }
}
