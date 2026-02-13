'use client'

import { Alpha, Button, Text } from '@music-vine/cadence'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console (error tracking service integration later)
    console.error('Route error:', error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
      <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
        <svg
          className="h-6 w-6 text-red-600 dark:text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <Alpha>
        Something went wrong
      </Alpha>
      <Text>
        {error.message || 'An unexpected error occurred. Please try again.'}
      </Text>
      {error.digest && (
        <Text className='text-opacity-50'>
          Error ID: {error.digest}
        </Text>
      )}
      <Button
        onClick={reset}
        className="mt-4"
      >
        Try again
      </Button>
    </div>
  )
}
