import { getCollections } from '@/lib/api/collections'
import { Button } from '@music-vine/cadence'
import Link from 'next/link'
import { CollectionTable } from './components/CollectionTable'
import { ExportCollectionsButton } from './components/ExportCollectionsButton'

interface PageProps {
  searchParams: Promise<{ platform?: string; query?: string; page?: string }>
}

export default async function CollectionsPage({ searchParams }: PageProps) {
  const { platform, query, page } = await searchParams
  const collections = await getCollections({
    platform: platform as any,
    query,
    page: page ? parseInt(page) : 1,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Collections</h1>
          <p className="mt-1 text-sm text-gray-600">
            Organize assets into curated collections
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportCollectionsButton collections={collections.data} />
          <Button variant="bold">Create Collection</Button>
        </div>
      </div>

      {/* Collections table */}
      {collections.data.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600">No collections found.</p>
          <Button variant="bold" className="mt-4">
            Create Collection
          </Button>
        </div>
      ) : (
        <CollectionTable collections={collections.data} />
      )}

      {/* Pagination */}
      {collections.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-600">
            Page {collections.pagination.page} of {collections.pagination.totalPages}
          </div>
          <div className="flex items-center gap-2">
            {collections.pagination.page > 1 && (
              <Link href={`/collections?page=${collections.pagination.page - 1}`}>
                <Button variant="subtle" size="sm">
                  Previous
                </Button>
              </Link>
            )}
            {collections.pagination.page < collections.pagination.totalPages && (
              <Link href={`/collections?page=${collections.pagination.page + 1}`}>
                <Button variant="subtle" size="sm">
                  Next
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
