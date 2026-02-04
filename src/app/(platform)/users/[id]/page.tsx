import { notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchUser } from '@/lib/api/users'
import { UserDetailTabs } from './components/UserDetailTabs'

interface UserDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

/**
 * User detail page with tabbed navigation.
 * Shows comprehensive user information organized into Profile, Subscription, and Downloads sections.
 */
export default async function UserDetailPage({
  params,
  searchParams,
}: UserDetailPageProps) {
  // Await params and searchParams (Next.js 15 pattern)
  const { id } = await params
  const { tab } = await searchParams

  // Fetch user data server-side
  let user
  try {
    user = await fetchUser(id)
  } catch (error) {
    notFound()
  }

  // Determine active tab (default to 'profile')
  const validTabs = ['profile', 'subscription', 'downloads']
  const activeTab = tab && validTabs.includes(tab) ? tab : 'profile'

  // Format status timestamp
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Get first letter of email for avatar
  const avatarLetter = user.email.charAt(0).toUpperCase()

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/users"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to users
      </Link>

      {/* User header */}
      <div className="flex items-start gap-6">
        {/* Avatar placeholder */}
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-2xl font-semibold text-gray-600">
          {avatarLetter}
        </div>

        <div className="flex-1">
          {/* Name */}
          <h1 className="text-2xl font-semibold text-gray-900">
            {user.name || 'No name'}
          </h1>

          {/* Email */}
          <p className="mt-1 text-gray-600">{user.email}</p>

          {/* Status and ID */}
          <div className="mt-3 flex items-center gap-4">
            {/* Status badge */}
            {user.status === 'active' ? (
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                Active
              </span>
            ) : (
              <div className="inline-flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                  Suspended
                </span>
                {user.suspendedAt && (
                  <span className="text-sm text-gray-500">
                    since {formatDate(user.suspendedAt)}
                  </span>
                )}
              </div>
            )}

            {/* User ID */}
            <span className="text-sm text-gray-500">ID: {user.id}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <UserDetailTabs user={user} activeTab={activeTab} />
    </div>
  )
}
