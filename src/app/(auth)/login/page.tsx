import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { buildCognitoLoginUrl } from '@/lib/auth/cognito'

async function signInWithGoogle() {
  'use server'

  // Generate PKCE values server-side so the verifier never touches the browser
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')
  const state = crypto.randomBytes(16).toString('hex')

  // Store verifier and state in short-lived HttpOnly cookies for the callback to read
  const cookieStore = await cookies()
  cookieStore.set('pkce_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 300, // 5 minutes — plenty of time to complete the OAuth redirect
    path: '/',
  })
  cookieStore.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 300,
    path: '/',
  })

  redirect(buildCognitoLoginUrl(state, codeChallenge))
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const errorMessages: Record<string, string> = {
    missing_params: 'Sign-in failed — missing parameters. Please try again.',
    invalid_state: 'Sign-in failed — session mismatch. Please try again.',
    token_exchange_failed: 'Sign-in failed — could not retrieve tokens. Please try again.',
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Conductor
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sign in with your MusicVine account
        </p>
      </div>

      <ErrorMessage searchParams={searchParams} errorMessages={errorMessages} />

      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <GoogleIcon />
          Sign in with Google
        </button>
      </form>
    </div>
  )
}

async function ErrorMessage({
  searchParams,
  errorMessages,
}: {
  searchParams: Promise<{ error?: string }>
  errorMessages: Record<string, string>
}) {
  const params = await searchParams
  if (!params.error) return null
  const message = errorMessages[params.error] ?? 'An unexpected error occurred. Please try again.'
  return (
    <p className="mb-4 text-center text-sm text-red-600 dark:text-red-400">{message}</p>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  )
}
