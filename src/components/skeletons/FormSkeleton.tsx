'use client'

import { BaseSkeleton } from './BaseSkeleton'

interface FormSkeletonProps {
  fields?: number
  hasSubmitButton?: boolean
}

export function FormSkeleton({ fields = 3, hasSubmitButton = true }: FormSkeletonProps) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <BaseSkeleton width="w-24" height="h-4" />
          <BaseSkeleton height="h-10" className="rounded-lg" />
        </div>
      ))}
      {hasSubmitButton && (
        <BaseSkeleton width="w-30" height="h-11" className="rounded-lg" />
      )}
    </div>
  )
}
