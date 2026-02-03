'use client'

import { BaseSkeleton } from './BaseSkeleton'

interface CardSkeletonProps {
  hasImage?: boolean
  lines?: number
}

export function CardSkeleton({ hasImage = false, lines = 3 }: CardSkeletonProps) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      {hasImage && (
        <BaseSkeleton height={160} className="mb-4 rounded-lg" />
      )}
      <BaseSkeleton width="60%" height={24} className="mb-2" />
      {Array.from({ length: lines }).map((_, i) => (
        <BaseSkeleton
          key={i}
          width={i === lines - 1 ? '80%' : '100%'}
          height={16}
          className="mb-1"
        />
      ))}
    </div>
  )
}
