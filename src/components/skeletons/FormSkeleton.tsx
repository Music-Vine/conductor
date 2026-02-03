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
          <BaseSkeleton width={100} height={16} />
          <BaseSkeleton height={40} className="rounded-lg" />
        </div>
      ))}
      {hasSubmitButton && (
        <BaseSkeleton width={120} height={44} className="rounded-lg" />
      )}
    </div>
  )
}
