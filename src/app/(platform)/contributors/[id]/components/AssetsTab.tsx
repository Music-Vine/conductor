'use client'

import { useRouter } from 'next/navigation'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { EmptyState } from '@/components/empty-states/EmptyState'

/**
 * Asset list item returned by /api/contributors/[id]/assets.
 */
export interface ContributorAssetListItem {
  id: string
  title: string
  type: 'music' | 'sfx' | 'motion-graphics' | 'lut' | 'stock-footage'
  status:
    | 'draft'
    | 'initial_review'
    | 'quality_check'
    | 'platform_assignment'
    | 'final_approval'
    | 'approved'
    | 'rejected'
    | 'published'
  createdAt: string
}

interface AssetsTabProps {
  assets: ContributorAssetListItem[]
}

/**
 * Asset type badge color mapping.
 */
const TYPE_BADGE_CLASSES: Record<ContributorAssetListItem['type'], string> = {
  music: 'inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800',
  sfx: 'inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800',
  'motion-graphics':
    'inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800',
  lut: 'inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800',
  'stock-footage':
    'inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800',
}

const TYPE_LABELS: Record<ContributorAssetListItem['type'], string> = {
  music: 'Music',
  sfx: 'SFX',
  'motion-graphics': 'Motion Graphics',
  lut: 'LUT',
  'stock-footage': 'Stock Footage',
}

/**
 * Status badge color mapping.
 */
const STATUS_BADGE_CLASSES: Record<ContributorAssetListItem['status'], string> =
  {
    draft: 'inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800',
    initial_review:
      'inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800',
    quality_check:
      'inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800',
    platform_assignment:
      'inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800',
    final_approval:
      'inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800',
    approved:
      'inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800',
    rejected:
      'inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800',
    published:
      'inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800',
  }

const STATUS_LABELS: Record<ContributorAssetListItem['status'], string> = {
  draft: 'Draft',
  initial_review: 'Initial Review',
  quality_check: 'Quality Check',
  platform_assignment: 'Platform Assignment',
  final_approval: 'Final Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  published: 'Published',
}

const columnHelper = createColumnHelper<ContributorAssetListItem>()

/**
 * Assets tab displaying the contributor's associated assets.
 * Clicking a row navigates to the asset detail page.
 */
export function AssetsTab({ assets }: AssetsTabProps) {
  const router = useRouter()

  const columns = [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: (info) => (
        <span className="font-medium text-gray-900">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: (info) => {
        const type = info.getValue()
        return (
          <span className={TYPE_BADGE_CLASSES[type]}>{TYPE_LABELS[type]}</span>
        )
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue()
        return (
          <span className={STATUS_BADGE_CLASSES[status]}>
            {STATUS_LABELS[status]}
          </span>
        )
      },
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: (info) =>
        new Date(info.getValue()).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    }),
  ]

  const table = useReactTable({
    data: assets,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (assets.length === 0) {
    return (
      <EmptyState
        type="no-results"
        title="No assets found"
        description="No assets found for this contributor."
      />
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => router.push(`/assets/${row.original.id}`)}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-sm text-gray-700">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
