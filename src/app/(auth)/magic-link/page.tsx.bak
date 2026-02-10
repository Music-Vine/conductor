import Link from 'next/link'
import { Button } from '@music-vine/cadence/ui'
import { validateMagicLink } from './actions'

/**
 * Magic link callback page.
 * Validates the token from URL and creates session.
 *
 * Server component that handles validation server-side to properly support
 * redirect() from server actions.
 */
interface MagicLinkPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function MagicLinkPage({ searchParams }: MagicLinkPageProps) {
  const { token } = await searchParams

  if (!token) {
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
            No magic link token provided
          </p>
          <Button asChild variant="bold">
            <Link href="/login">Back to login</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Validate the magic link token
  // This will redirect to dashboard on success, or return error state
  const result = await validateMagicLink(token)

  // If we reach here, validation failed (redirect didn't happen)
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
          {result.error || 'An unexpected error occurred'}
        </p>
        <Button asChild variant="bold">
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    </div>
  )
}
