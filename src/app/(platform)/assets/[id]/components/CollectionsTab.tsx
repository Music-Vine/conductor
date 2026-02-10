'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@music-vine/cadence'
import type { Asset } from '@/types/asset'
import type { CollectionListItem } from '@/types/collection'
import { getCollections, addAssetsToCollection, removeAssetFromCollection } from '@/lib/api/collections'
import { toast } from 'sonner'

interface CollectionsTabProps {
  asset: Asset
}

export function CollectionsTab({ asset }: CollectionsTabProps) {
  const router = useRouter()
  const [collections, setCollections] = useState<CollectionListItem[]>([])
  const [allCollections, setAllCollections] = useState<CollectionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    async function loadCollections() {
      try {
        // Get all collections to find which ones contain this asset
        const all = await getCollections({ limit: 100 })
        setAllCollections(all.data)

        // Filter to collections containing this asset
        // (In real implementation, this would be a separate API call)
        const containing = all.data.filter((c: any) =>
          c.assetIds?.includes(asset.id)
        )
        setCollections(containing)
      } catch (error) {
        console.error('Failed to load collections:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCollections()
  }, [asset.id])

  const handleAddToCollection = async (collectionId: string) => {
    try {
      await addAssetsToCollection(collectionId, [asset.id])
      toast.success('Added to collection')
      router.refresh()
      setShowAddModal(false)
      // Refresh collections list
      const all = await getCollections({ limit: 100 })
      const containing = all.data.filter((c: any) => c.assetIds?.includes(asset.id))
      setCollections(containing)
    } catch (error) {
      toast.error('Failed to add to collection')
    }
  }

  const handleRemoveFromCollection = async (collectionId: string) => {
    try {
      await removeAssetFromCollection(collectionId, asset.id)
      toast.success('Removed from collection')
      setCollections(prev => prev.filter(c => c.id !== collectionId))
    } catch (error) {
      toast.error('Failed to remove from collection')
    }
  }

  const availableCollections = allCollections.filter(
    c => !collections.find(existing => existing.id === c.id)
  )

  if (loading) {
    return <div className="text-gray-500">Loading collections...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          In {collections.length} Collection{collections.length !== 1 ? 's' : ''}
        </h2>
        <Button variant="subtle" onClick={() => setShowAddModal(true)}>
          Add to Collection
        </Button>
      </div>

      {/* Collections list */}
      {collections.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">This asset is not in any collections.</p>
          <Button
            variant="bold"
            className="mt-4"
            onClick={() => setShowAddModal(true)}
          >
            Add to Collection
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
          {collections.map((collection) => (
            <li key={collection.id} className="flex items-center justify-between p-4">
              <Link
                href={`/collections/${collection.id}`}
                className="font-medium text-gray-900 hover:text-platform-primary"
              >
                {collection.title}
              </Link>
              <button
                onClick={() => handleRemoveFromCollection(collection.id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add to collection modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add to Collection
            </h3>

            {availableCollections.length === 0 ? (
              <p className="text-gray-600">No available collections.</p>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-64 overflow-auto">
                {availableCollections.map((collection) => (
                  <li key={collection.id}>
                    <button
                      onClick={() => handleAddToCollection(collection.id)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50"
                    >
                      {collection.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 flex justify-end">
              <Button variant="subtle" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
