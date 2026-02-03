'use client'

import { BaseSkeleton } from './BaseSkeleton'

interface TableRowSkeletonProps {
  columns?: number
  rows?: number
}

export function TableRowSkeleton({ columns = 4, rows = 5 }: TableRowSkeletonProps) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 border-b border-zinc-200 pb-2 dark:border-zinc-800">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1">
            <BaseSkeleton height={20} />
          </div>
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1">
              <BaseSkeleton height={16} width={colIndex === 0 ? '80%' : '60%'} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
