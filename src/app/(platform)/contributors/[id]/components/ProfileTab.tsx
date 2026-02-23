'use client'

import type { Contributor } from '@/types'

interface ProfileTabProps {
  contributor: Contributor
}

/**
 * Format a date string to a readable format.
 */
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Mask a tax ID to show only the last 4 digits.
 * e.g. "123-45-6789" → "***-**-6789"
 */
function maskTaxId(taxId: string): string {
  const digits = taxId.replace(/\D/g, '')
  const last4 = digits.slice(-4)
  // Format as ***-**-XXXX for SSN-style, or ***-XXXXXX for EIN-style
  if (digits.length === 9) {
    return `***-**-${last4}`
  }
  // Generic masking: asterisks for all but last 4 digits
  const masked = '*'.repeat(digits.length - 4)
  return `${masked}${last4}`
}

/**
 * Status badge component for contributor status.
 */
function StatusBadge({ status }: { status: Contributor['status'] }) {
  const classes =
    status === 'active'
      ? 'inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800'
      : status === 'inactive'
        ? 'inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800'
        : 'inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800'

  const label =
    status === 'active'
      ? 'Active'
      : status === 'inactive'
        ? 'Inactive'
        : 'Pending'

  return <span className={classes}>{label}</span>
}

/**
 * Profile tab content showing contributor identity, address, and account info.
 */
export function ProfileTab({ contributor }: ProfileTabProps) {
  return (
    <div className="space-y-8">
      {/* Section 1: Contact Info */}
      <section>
        <h2 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
          Contact Information
        </h2>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-600">Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{contributor.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{contributor.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Phone</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {contributor.phone || (
                <span className="italic text-gray-500">Not set</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Tax ID</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {contributor.taxId ? (
                maskTaxId(contributor.taxId)
              ) : (
                <span className="font-sans italic text-gray-500">Not set</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      {/* Section 2: Address */}
      <section>
        <h2 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
          Address
        </h2>
        {contributor.address ? (
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-600">Street</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {contributor.address.street}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">City</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {contributor.address.city}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">State</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {contributor.address.state}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">ZIP Code</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {contributor.address.zip}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Country</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {contributor.address.country}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm italic text-gray-500">No address on file</p>
        )}
      </section>

      {/* Section 3: Account Info */}
      <section>
        <h2 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
          Account Information
        </h2>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-600">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={contributor.status} />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Contributor ID</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {contributor.id}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Created</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatDate(contributor.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Last Updated</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatDate(contributor.updatedAt)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Section 4: Summary Stats */}
      <section>
        <h2 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
          Summary
        </h2>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
            <dt className="text-sm font-medium text-gray-600">Total Assets</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {contributor.totalAssets}
            </dd>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
            <dt className="text-sm font-medium text-gray-600">Total Payees</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {contributor.totalPayees}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
