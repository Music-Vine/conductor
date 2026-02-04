import { Button } from '@music-vine/cadence'
import { ReactNode } from 'react'

export type EmptyStateType = 'first-use' | 'no-results' | 'error' | 'success'

interface EmptyStateAction {
  label: string
  onClick: () => void
  variant?: 'bold' | 'subtle'
}

interface EmptyStateProps {
  type: EmptyStateType
  title: string
  description: string
  action?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  icon?: ReactNode
  className?: string
}

// Icons for different states
const icons: Record<EmptyStateType, ReactNode> = {
  'first-use': (
    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  'no-results': (
    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  'error': (
    <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  'success': (
    <svg className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export function EmptyState({
  type,
  title,
  description,
  action,
  secondaryAction,
  icon,
  className = '',
}: EmptyStateProps) {
  const displayIcon = icon || icons[type]

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      {displayIcon && (
        <div className="mb-4">
          {displayIcon}
        </div>
      )}

      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>

      <p className="text-sm text-gray-500 max-w-md mb-6">
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button
              variant={action.variant === 'subtle' ? 'subtle' : 'bold'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="subtle"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Pre-configured variants for common use cases
export function NoResultsEmptyState({
  searchQuery,
  onClearFilters,
}: {
  searchQuery?: string
  onClearFilters?: () => void
}) {
  return (
    <EmptyState
      type="no-results"
      title="No results found"
      description={
        searchQuery
          ? `No results match "${searchQuery}". Try adjusting your search or filters.`
          : 'Try adjusting your search or filters to find what you\'re looking for.'
      }
      action={onClearFilters ? { label: 'Clear filters', onClick: onClearFilters } : undefined}
    />
  )
}

export function FirstUseEmptyState({
  entityName,
  onCreateNew,
}: {
  entityName: string
  onCreateNew?: () => void
}) {
  return (
    <EmptyState
      type="first-use"
      title={`No ${entityName} yet`}
      description={`Get started by creating your first ${entityName.toLowerCase()}.`}
      action={onCreateNew ? { label: `Create ${entityName}`, onClick: onCreateNew } : undefined}
    />
  )
}

export function ErrorEmptyState({
  onRetry,
}: {
  onRetry?: () => void
}) {
  return (
    <EmptyState
      type="error"
      title="Something went wrong"
      description="We couldn't load the data. Please try again."
      action={onRetry ? { label: 'Try again', onClick: onRetry } : undefined}
    />
  )
}

export function SuccessEmptyState({
  title = 'All caught up!',
  description = 'You\'ve processed all pending items.',
}: {
  title?: string
  description?: string
}) {
  return (
    <EmptyState
      type="success"
      title={title}
      description={description}
    />
  )
}
