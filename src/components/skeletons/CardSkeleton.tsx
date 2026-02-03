'use client'

import { BaseSkeleton } from './BaseSkeleton'

interface CardSkeletonProps {
  hasImage?: boolean
  lines?: number
}

export function CardSkeleton({ hasImage = false, lines = 3 }: CardSkeletonProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      {hasImage && (
        <BaseSkeleton height="h-40" className="mb-4 rounded-lg" />
      )}
      <BaseSkeleton width="w-3/5" height="h-6" className="mb-2" />
      {Array.from({ length: lines }).map((_, i) => (
        <BaseSkeleton
          key={i}
          width={i === lines - 1 ? 'w-4/5' : 'w-full'}
          height="h-4"
          className="mb-1"
        />
      ))}
    </div>
  )
}
