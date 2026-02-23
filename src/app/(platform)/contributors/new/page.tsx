'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { createContributor } from '@/lib/api/contributors'
import { ContributorForm } from '../components/ContributorForm'
import type { ContributorFormData } from '@/lib/validation/financial'
import { useState } from 'react'

/**
 * Add new contributor page.
 * Renders ContributorForm and handles API submission, success toast, and redirect.
 */
export default function NewContributorPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(data: ContributorFormData) {
    setIsSubmitting(true)
    try {
      const contributor = await createContributor(data)
      toast.success('Contributor added successfully')
      router.push(`/contributors/${contributor.id}`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to add contributor'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCancel() {
    router.push('/contributors')
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/contributors"
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
        Back to Contributors
      </Link>

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Add Contributor</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add a new contributor to the platform.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ContributorForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          mode="create"
        />
      </div>
    </div>
  )
}
