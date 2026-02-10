import { getCollections } from '@/lib/api/collections'
import { Button } from '@music-vine/cadence'
import Link from 'next/link'

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
        <Button variant="bold">Create Collection</Button>
      </div>

      {/* Collection grid */}
      {collections.data.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600">No collections found.</p>
          <Button variant="bold" className="mt-4">
            Create Collection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.data.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
            >
              <h3 className="font-medium text-gray-900">{collection.title}</h3>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <span>{collection.assetCount} assets</span>
                <span>•</span>
                <span className="capitalize">
                  {collection.platform === 'both'
                    ? 'All Platforms'
                    : collection.platform === 'music-vine'
                    ? 'Music Vine'
                    : 'Uppbeat'}
                </span>
              </div>
            </Link>
          ))}
        </div>
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
