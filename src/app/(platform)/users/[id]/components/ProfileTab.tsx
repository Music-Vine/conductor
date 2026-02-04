'use client'

import type { UserDetail } from '@/types'
import { OAuthConnections } from './OAuthConnections'

interface ProfileTabProps {
  user: UserDetail
}

/**
 * Profile tab content showing user identity and account status.
 */
export function ProfileTab({ user }: ProfileTabProps) {
  return (
    <div className="space-y-8">
      {/* Identity Section */}
      <section>
        <h2 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
          Identity Information
        </h2>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-600">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {user.name || (
                <span className="text-gray-500 italic">Not set</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Username</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {user.username || (
                <span className="text-gray-500 italic">Not set</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">User ID</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">{user.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Platform</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.platform === 'music-vine'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-pink-100 text-pink-800'
                }`}
              >
                {user.platform === 'music-vine' ? 'Music Vine' : 'Uppbeat'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Created</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </dd>
          </div>
        </dl>
      </section>

      {/* Account Status Section */}
      <section>
        <h2 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
          Account Status
        </h2>
        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-600">Status: </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                user.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {user.status === 'active' ? 'Active' : 'Suspended'}
            </span>
          </div>

          {user.status === 'suspended' && (
            <div className="rounded-md bg-red-50 p-4">
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-red-800">
                    Suspended at
                  </dt>
                  <dd className="mt-1 text-sm text-red-700">
                    {user.suspendedAt
                      ? new Date(user.suspendedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                        })
                      : 'Unknown'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-red-800">Reason</dt>
                  <dd className="mt-1 text-sm text-red-700">
                    {user.suspendedReason || 'No reason provided'}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              disabled
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {user.status === 'active' ? 'Suspend Account' : 'Unsuspend Account'}
            </button>
            <p className="mt-2 text-xs text-gray-500">
              Suspend/Unsuspend functionality will be implemented in a later plan
            </p>
          </div>
        </div>
      </section>

      {/* OAuth Connections Section */}
      <section>
        <h2 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
          Connected Accounts
        </h2>
        <OAuthConnections
          userId={user.id}
          connections={user.oauthConnections}
        />
      </section>
    </div>
  )
}
