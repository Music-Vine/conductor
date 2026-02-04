'use client'

import type { UserDetail } from '@/types'
import { Badge } from '@music-vine/cadence'
import { RefundDialog } from './RefundDialog'

interface SubscriptionTabProps {
  user: UserDetail
}

/**
 * Subscription tab showing plan details, entitlements, billing history, and refund actions.
 */
export function SubscriptionTab({ user }: SubscriptionTabProps) {
  const { subscription } = user

  // Determine subscription status
  const isExpired = subscription.expiresAt
    ? new Date(subscription.expiresAt) < new Date()
    : false
  const isFree = subscription.tier === 'free'

  // Mock billing history (in production, this would come from API)
  const mockBillingHistory =
    subscription.tier !== 'free'
      ? [
          {
            id: '1',
            date: '2026-01-01',
            amount: '$29.00',
            status: 'Paid' as const,
            invoiceUrl: '#',
          },
          {
            id: '2',
            date: '2025-12-01',
            amount: '$29.00',
            status: 'Paid' as const,
            invoiceUrl: '#',
          },
          {
            id: '3',
            date: '2025-11-01',
            amount: '$29.00',
            status: 'Paid' as const,
            invoiceUrl: '#',
          },
        ]
      : []

  // Get tier badge color
  const getTierBadgeVariant = () => {
    switch (subscription.tier) {
      case 'free':
        return 'neutral'
      case 'creator':
        return 'info'
      case 'pro':
        return 'success'
      case 'enterprise':
        return 'warning'
      default:
        return 'neutral'
    }
  }

  // Get entitlements based on tier
  const getEntitlements = () => {
    switch (subscription.tier) {
      case 'free':
        return [
          { text: 'Limited downloads', enabled: true },
          { text: 'Watermarked content', enabled: true },
          { text: 'Basic support', enabled: true },
        ]
      case 'creator':
        return [
          { text: '100 downloads/month', enabled: true },
          { text: 'No watermarks', enabled: true },
          { text: 'Email support', enabled: true },
          { text: 'Commercial license', enabled: true },
        ]
      case 'pro':
        return [
          { text: 'Unlimited downloads', enabled: true },
          { text: 'No watermarks', enabled: true },
          { text: 'Priority support', enabled: true },
          { text: 'Commercial license', enabled: true },
          { text: 'Advanced search', enabled: true },
        ]
      case 'enterprise':
        return [
          { text: 'Unlimited downloads', enabled: true },
          { text: 'Team management', enabled: true },
          { text: 'Dedicated account manager', enabled: true },
          { text: 'Custom licensing', enabled: true },
          { text: 'API access', enabled: true },
          { text: 'White-label options', enabled: true },
        ]
      default:
        return []
    }
  }

  const entitlements = getEntitlements()

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Current Plan
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Subscription Tier</span>
            <Badge variant={getTierBadgeVariant()}>
              {subscription.tier.charAt(0).toUpperCase() +
                subscription.tier.slice(1)}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Plan Started</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(subscription.startedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {subscription.expiresAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {isExpired ? 'Plan Expired' : 'Plan Renews'}
              </span>
              <span
                className={`text-sm font-medium ${
                  isExpired ? 'text-red-600' : 'text-gray-900'
                }`}
              >
                {new Date(subscription.expiresAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Billing Email</span>
            <span className="text-sm font-medium text-gray-900">
              {subscription.billingEmail}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <Badge variant={isExpired ? 'error' : 'success'}>
              {isExpired ? 'Expired' : 'Active'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Entitlements */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Entitlements
        </h3>

        <ul className="space-y-2">
          {entitlements.map((entitlement, index) => (
            <li key={index} className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm text-gray-900">{entitlement.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Billing History */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Billing History
        </h3>

        {mockBillingHistory.length > 0 ? (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Date
                  </th>
                  <th className="py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Amount
                  </th>
                  <th className="py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockBillingHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td className="py-3 text-sm text-gray-900">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 text-sm font-medium text-gray-900">
                      {entry.amount}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={
                          entry.status === 'Paid'
                            ? 'success'
                            : entry.status === 'Refunded'
                              ? 'warning'
                              : 'error'
                        }
                      >
                        {entry.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <a
                        href={entry.invoiceUrl}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No billing history</p>
        )}
      </div>

      {/* Actions */}
      {!isFree && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Actions</h3>

          <RefundDialog userId={user.id} />
        </div>
      )}
    </div>
  )
}
