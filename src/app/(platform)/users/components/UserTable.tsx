'use client'

import { useRouter } from 'next/navigation'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { UserListItem } from '@/types/user'
import type { PaginatedResponse } from '@/types/api'
import { UserRowActions } from './UserRowActions'

interface UserTableProps {
  data: UserListItem[]
  pagination: {
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
  }
}

const columnHelper = createColumnHelper<UserListItem>()

const columns = [
  columnHelper.accessor((row) => ({ email: row.email, name: row.name }), {
    id: 'user',
    header: 'User',
    cell: (info) => {
      const { email, name } = info.getValue()
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{email}</span>
          {name && <span className="text-sm text-gray-500">{name}</span>}
        </div>
      )
    },
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => {
      const status = info.getValue()
      const isActive = status === 'active'
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {isActive ? 'Active' : 'Suspended'}
        </span>
      )
    },
  }),
  columnHelper.accessor('subscriptionTier', {
    header: 'Subscription',
    cell: (info) => {
      const tier = info.getValue()
      const tierLabels: Record<string, string> = {
        free: 'Free',
        essentials: 'Essentials',
        creator: 'Creator',
        pro: 'Pro',
        enterprise: 'Enterprise',
      }
      const tierColors: Record<string, string> = {
        free: 'text-gray-600',
        essentials: 'text-gray-500',
        creator: 'text-blue-600',
        pro: 'text-green-600',
        enterprise: 'text-gray-900',
      }
      return (
        <span className={`font-medium ${tierColors[tier] || 'text-gray-600'}`}>
          {tierLabels[tier] || tier}
        </span>
      )
    },
  }),
  columnHelper.accessor('lastLoginAt', {
    header: 'Last Login',
    cell: (info) => {
      const lastLogin = info.getValue()
      if (!lastLogin) return <span className="text-gray-400">Never</span>

      const date = new Date(lastLogin)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return <span className="text-gray-700">Today</span>
      } else if (diffDays === 1) {
        return <span className="text-gray-700">Yesterday</span>
      } else if (diffDays < 7) {
        return <span className="text-gray-700">{diffDays} days ago</span>
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7)
        return <span className="text-gray-600">{weeks} {weeks === 1 ? 'week' : 'weeks'} ago</span>
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30)
        return <span className="text-gray-600">{months} {months === 1 ? 'month' : 'months'} ago</span>
      } else {
        return (
          <span className="text-gray-500">
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )
      }
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: (info) => <UserRowActions user={info.row.original} />,
  }),
]

export function UserTable({ data, pagination }: UserTableProps) {
  const router = useRouter()

  // Defensive checks
  if (!data || !Array.isArray(data)) {
    return (
      <div className="p-8 text-center text-gray-500">
        No users data available
      </div>
    )
  }

  if (!pagination) {
    return (
      <div className="p-8 text-center text-gray-500">
        Pagination data unavailable
      </div>
    )
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount: pagination.totalPages,
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.pageSize,
      },
    },
  })

  function handleRowClick(userId: string) {
    router.push(`/users/${userId}`)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-gray-200">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
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
              onClick={() => handleRowClick(row.original.id)}
              className="cursor-pointer transition-colors hover:bg-gray-100"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="whitespace-nowrap px-6 py-4 text-sm"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          No users found. Try adjusting your search filters.
        </div>
      )}
    </div>
  )
}
