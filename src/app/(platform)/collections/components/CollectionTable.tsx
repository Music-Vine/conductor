'use client'

import { useRouter } from 'next/navigation'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { CollectionListItem } from '@/types'

interface CollectionTableProps {
  collections: CollectionListItem[]
}

const columnHelper = createColumnHelper<CollectionListItem>()

const platformBadgeClasses: Record<string, string> = {
  'music-vine': 'bg-red-100 text-red-800',
  uppbeat: 'bg-pink-100 text-pink-800',
  both: 'bg-gray-100 text-gray-800',
}

const platformLabels: Record<string, string> = {
  'music-vine': 'Music Vine',
  uppbeat: 'Uppbeat',
  both: 'All Platforms',
}

const columns = [
  columnHelper.accessor('title', {
    header: 'Title',
    size: 300,
    cell: (info) => (
      <span className="font-medium text-gray-900">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('platform', {
    header: 'Platform',
    size: 150,
    cell: (info) => {
      const platform = info.getValue()
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${platformBadgeClasses[platform] || 'bg-gray-100 text-gray-800'}`}
        >
          {platformLabels[platform] || platform}
        </span>
      )
    },
  }),
  columnHelper.accessor('assetCount', {
    header: 'Asset Count',
    size: 120,
    cell: (info) => (
      <span className="text-gray-700">{info.getValue().toLocaleString()}</span>
    ),
  }),
  columnHelper.accessor('createdAt', {
    header: 'Created',
    size: 150,
    cell: (info) => {
      const date = new Date(info.getValue())
      return (
        <span className="text-gray-600">
          {date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      )
    },
  }),
]

// Grid template columns for consistent layout
const gridTemplateColumns = '1fr 150px 120px 150px'

export function CollectionTable({ collections }: CollectionTableProps) {
  const router = useRouter()

  const table = useReactTable({
    data: collections,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (!collections || collections.length === 0) {
    return null
  }

  function handleRowClick(collectionId: string) {
    router.push(`/collections/${collectionId}`)
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      {/* Fixed header */}
      <div className="bg-gray-50 border-b border-gray-200">
        {table.getHeaderGroups().map((headerGroup) => (
          <div
            key={headerGroup.id}
            className="grid"
            style={{ gridTemplateColumns }}
          >
            {headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Table body */}
      <div className="bg-white divide-y divide-gray-100">
        {table.getRowModel().rows.map((row) => (
          <div
            key={row.id}
            onClick={() => handleRowClick(row.original.id)}
            className="grid cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ gridTemplateColumns }}
          >
            {row.getVisibleCells().map((cell) => (
              <div
                key={cell.id}
                className="px-6 py-4 text-sm flex items-center"
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
