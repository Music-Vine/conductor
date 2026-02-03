'use client'

import { Skeleton, SkeletonFragment } from '@music-vine/cadence/ui'
import type { HTMLAttributes } from 'react'

export interface BaseSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of skeleton elements to render */
  count?: number
  /** Width of skeleton (use Tailwind classes like "w-full", "w-32") */
  width?: string
  /** Height of skeleton (use Tailwind classes like "h-4", "h-8") */
  height?: string
  /** Whether skeleton should be circular */
  circle?: boolean
}

/**
 * Base skeleton component using Cadence Skeleton primitive.
 *
 * @example
 * // Single line skeleton
 * <BaseSkeleton height="h-4" width="w-full" />
 *
 * @example
 * // Multiple skeletons
 * <BaseSkeleton count={3} height="h-4" width="w-full" />
 *
 * @example
 * // Avatar skeleton
 * <BaseSkeleton circle height="h-12" width="w-12" />
 */
export function BaseSkeleton({
  count = 1,
  width = 'w-full',
  height = 'h-4',
  circle = false,
  className = '',
  ...props
}: BaseSkeletonProps) {
  const shapeClass = circle ? 'rounded-full' : 'rounded-md'

  return (
    <Skeleton
      items={count}
      className={`${width} ${height} ${shapeClass} ${className}`}
      {...props}
    />
  )
}

// Re-export SkeletonFragment for complex layouts
export { SkeletonFragment }
