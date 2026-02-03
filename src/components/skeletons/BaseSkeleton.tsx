'use client'

import Skeleton, { SkeletonProps } from 'react-loading-skeleton'

export interface BaseSkeletonProps extends SkeletonProps {
  className?: string
}

export function BaseSkeleton({ className, ...props }: BaseSkeletonProps) {
  return (
    <Skeleton
      baseColor="var(--skeleton-base, #e5e7eb)"
      highlightColor="var(--skeleton-highlight, #f3f4f6)"
      className={className}
      {...props}
    />
  )
}
