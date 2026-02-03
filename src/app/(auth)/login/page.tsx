'use client'

import { useActionState } from 'react'
import { Input, Button } from '@music-vine/cadence/ui'
import { loginAction, type LoginState } from './actions'

/**
 * Login page - minimal design per CONTEXT.md.
 * Just email field, Remember Me checkbox, clear feedback, fast aesthetic.
 * Uses Cadence design system components for consistency.
 */
export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<LoginState | null, FormData>(
    loginAction,
    null
  )

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Conductor
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in with your email
        </p>
      </div>

      {state?.success ? (
        <SuccessMessage message={state.message} debugUrl={state.debugUrl} />
      ) : (
        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              className="mt-1"
              placeholder="you@company.com"
            />
          </div>

          {/* Remember Me checkbox - extends session to 30 days per CONTEXT.md */}
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300"
            >
              Remember me for 30 days
            </label>
          </div>

          {state?.message && !state.success && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            variant="bold"
            className="w-full"
          >
            {isPending ? 'Sending...' : 'Send magic link'}
          </Button>
        </form>
      )}
    </div>
  )
}

function SuccessMessage({
  message,
  debugUrl,
}: {
  message?: string
  debugUrl?: string
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
        <svg
          className="h-6 w-6 text-green-600 dark:text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <p className="text-zinc-600 dark:text-zinc-400">
        {message || 'Check your email for a magic link'}
      </p>

      {/* Development only: Show clickable link */}
      {debugUrl && process.env.NODE_ENV === 'development' && (
        <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20">
          <p className="mb-2 text-xs font-medium text-yellow-800 dark:text-yellow-200">
            Development Only
          </p>
          <a
            href={debugUrl}
            className="text-sm text-yellow-700 underline hover:text-yellow-800 dark:text-yellow-300"
          >
            Click here to sign in
          </a>
        </div>
      )}
    </div>
  )
}
