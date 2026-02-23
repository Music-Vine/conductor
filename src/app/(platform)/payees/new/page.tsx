'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { createPayee } from '@/lib/api/payees'
import { PayeeForm } from '../components/PayeeForm'
import type { PayeeFormData } from '@/lib/validation/financial'

/**
 * Add new payee page.
 * Renders PayeeForm and handles API submission, success toast, and redirect.
 */
export default function NewPayeePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(data: PayeeFormData) {
    setIsSubmitting(true)
    try {
      const payee = await createPayee(data)
      toast.success('Payee added successfully')
      router.push(`/payees/${payee.id}`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to add payee'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCancel() {
    router.push('/payees')
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/payees"
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
        Back to Payees
      </Link>

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Add Payee</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add a new payee to receive royalty payments.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <PayeeForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          mode="create"
        />
      </div>
    </div>
  )
}
