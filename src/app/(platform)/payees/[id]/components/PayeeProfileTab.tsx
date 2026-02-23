'use client'

import type { Payee, PaymentMethod } from '@/types'

interface PayeeProfileTabProps {
  payee: Payee
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  ach: 'ACH',
  wire: 'Wire',
  check: 'Check',
  paypal: 'PayPal',
}

const paymentMethodBadgeClasses: Record<PaymentMethod, string> = {
  ach: 'bg-blue-100 text-blue-800',
  wire: 'bg-purple-100 text-purple-800',
  check: 'bg-gray-100 text-gray-800',
  paypal: 'bg-indigo-100 text-indigo-800',
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="col-span-2 text-sm text-gray-900">{value}</dd>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
      {children}
    </h3>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      {children}
    </div>
  )
}

/**
 * Profile tab for payee detail page.
 * Shows contact info, payment details (masked), tax info, address, and account info.
 */
export function PayeeProfileTab({ payee }: PayeeProfileTabProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Format address or show fallback
  const addressDisplay = payee.address
    ? [
        payee.address.street,
        `${payee.address.city}, ${payee.address.state} ${payee.address.zip}`,
        payee.address.country,
      ].join('\n')
    : null

  return (
    <div className="space-y-6">
      {/* Section 1: Contact Info */}
      <Section>
        <SectionTitle>Contact Information</SectionTitle>
        <dl className="divide-y divide-gray-100">
          <InfoRow label="Name" value={payee.name} />
          <InfoRow label="Email" value={<a href={`mailto:${payee.email}`} className="text-blue-600 hover:underline">{payee.email}</a>} />
          {payee.phone && (
            <InfoRow label="Phone" value={payee.phone} />
          )}
        </dl>
      </Section>

      {/* Section 2: Payment Details */}
      <Section>
        <SectionTitle>Payment Details</SectionTitle>
        <dl className="divide-y divide-gray-100">
          <InfoRow
            label="Payment Method"
            value={
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${paymentMethodBadgeClasses[payee.paymentMethod] || 'bg-gray-100 text-gray-800'}`}
              >
                {paymentMethodLabels[payee.paymentMethod] || payee.paymentMethod}
              </span>
            }
          />
          {payee.paymentDetails.accountNumber && (
            <InfoRow
              label="Account Number"
              value={
                <span className="font-mono text-gray-700">
                  {payee.paymentDetails.accountNumber}
                </span>
              }
            />
          )}
          {payee.paymentDetails.routingNumber && (
            <InfoRow
              label="Routing Number"
              value={
                <span className="font-mono text-gray-700">
                  {payee.paymentDetails.routingNumber}
                </span>
              }
            />
          )}
          {payee.paymentDetails.paypalEmail && (
            <InfoRow
              label="PayPal Email"
              value={
                <a
                  href={`mailto:${payee.paymentDetails.paypalEmail}`}
                  className="text-blue-600 hover:underline"
                >
                  {payee.paymentDetails.paypalEmail}
                </a>
              }
            />
          )}
        </dl>
      </Section>

      {/* Section 3: Tax Info */}
      {payee.taxId && (
        <Section>
          <SectionTitle>Tax Information</SectionTitle>
          <dl>
            <InfoRow
              label="Tax ID"
              value={
                <span className="font-mono text-gray-700">
                  {payee.taxId}
                </span>
              }
            />
          </dl>
        </Section>
      )}

      {/* Section 4: Address */}
      <Section>
        <SectionTitle>Address</SectionTitle>
        {addressDisplay ? (
          <p className="whitespace-pre-line text-sm text-gray-900">{addressDisplay}</p>
        ) : (
          <p className="text-sm text-gray-500 italic">No address on file</p>
        )}
      </Section>

      {/* Section 5: Account Info */}
      <Section>
        <SectionTitle>Account Information</SectionTitle>
        <dl className="divide-y divide-gray-100">
          <InfoRow
            label="Status"
            value={
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  payee.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {payee.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            }
          />
          <InfoRow label="Payee ID" value={<span className="font-mono text-gray-600">{payee.id}</span>} />
          <InfoRow label="Created" value={formatDate(payee.createdAt)} />
          <InfoRow label="Last Updated" value={formatDate(payee.updatedAt)} />
        </dl>
      </Section>
    </div>
  )
}
