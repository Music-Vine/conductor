'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@music-vine/cadence/ui'
import { validateMagicLink, type MagicLinkState } from './actions'

/**
 * Magic link callback page.
 * Validates the token from URL and creates session.
 */
function MagicLinkContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [state, setState] = useState<MagicLinkState | null>(null)
  const [isValidating, setIsValidating] = useState(true)

  useEffect(() => {
    async function validate() {
      if (!token) {
        setState({ error: 'No magic link token provided' })
        setIsValidating(false)
        return
      }

      try {
        // This will redirect on success
        const result = await validateMagicLink(token)
        // If we get here, there was an error (redirect didn't happen)
        setState(result)
      } catch (error) {
        // Server action threw (redirect happened, or actual error)
        // If redirect happened, component unmounts
        setState({ error: 'An unexpected error occurred' })
      } finally {
        setIsValidating(false)
      }
    }

    validate()
  }, [token])

  if (isValidating) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-700 dark:border-t-gray-100" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Signing you in...
          </p>
        </div>
      </div>
    )
  }

  if (state?.error) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
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
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {state.error}
          </p>
          <Button asChild variant="bold">
            <Link href="/login">Back to login</Link>
          </Button>
        </div>
      </div>
    )
  }

  return null
}

export default function MagicLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-700 dark:border-t-gray-100" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading...
            </p>
          </div>
        </div>
      }
    >
      <MagicLinkContent />
    </Suspense>
  )
}
