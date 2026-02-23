'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@music-vine/cadence/ui'
import { Label } from '@music-vine/cadence/ui'
import { CircleCheck, CircleAlert } from '@music-vine/cadence/icons'
import { contributorSchema, type ContributorFormData } from '@/lib/validation/financial'

interface ContributorFormProps {
  onSubmit: (data: ContributorFormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<ContributorFormData>
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
}

/**
 * Reusable contributor form component.
 * Uses react-hook-form with zod validation.
 * Validates on blur, re-validates on change after first error.
 */
export function ContributorForm({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false,
  mode = 'create',
}: ContributorFormProps) {
  const [showAddress, setShowAddress] = useState(!!initialData?.address)

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<ContributorFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(contributorSchema as any) as any,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: initialData,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6" noValidate>
      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Name"
          error={errors.name?.message}
          isTouched={!!touchedFields.name}
          required
        >
          <Input
            id="name"
            type="text"
            placeholder="Full name"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
        </FormField>

        <FormField
          label="Email"
          error={errors.email?.message}
          isTouched={!!touchedFields.email}
          required
        >
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <FormField
          label="Phone"
          error={errors.phone?.message}
          isTouched={!!touchedFields.phone}
        >
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            aria-invalid={!!errors.phone}
            {...register('phone')}
          />
        </FormField>

        <FormField
          label="Tax ID"
          error={errors.taxId?.message}
          isTouched={!!touchedFields.taxId}
        >
          <Input
            id="taxId"
            type="text"
            placeholder="SSN or EIN"
            aria-invalid={!!errors.taxId}
            {...register('taxId')}
          />
        </FormField>
      </div>

      {/* Address Section (collapsible) */}
      <div className="rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() => setShowAddress(!showAddress)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <span>Address (optional)</span>
          <svg
            className={`h-4 w-4 text-gray-500 transition-transform ${showAddress ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAddress && (
          <div className="border-t border-gray-200 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Street"
                error={errors.address?.street?.message}
                isTouched={!!touchedFields.address?.street}
                className="sm:col-span-2"
              >
                <Input
                  id="address.street"
                  type="text"
                  placeholder="123 Main St"
                  aria-invalid={!!errors.address?.street}
                  {...register('address.street')}
                />
              </FormField>

              <FormField
                label="City"
                error={errors.address?.city?.message}
                isTouched={!!touchedFields.address?.city}
              >
                <Input
                  id="address.city"
                  type="text"
                  placeholder="City"
                  aria-invalid={!!errors.address?.city}
                  {...register('address.city')}
                />
              </FormField>

              <FormField
                label="State"
                error={errors.address?.state?.message}
                isTouched={!!touchedFields.address?.state}
              >
                <Input
                  id="address.state"
                  type="text"
                  placeholder="State"
                  aria-invalid={!!errors.address?.state}
                  {...register('address.state')}
                />
              </FormField>

              <FormField
                label="ZIP Code"
                error={errors.address?.zip?.message}
                isTouched={!!touchedFields.address?.zip}
              >
                <Input
                  id="address.zip"
                  type="text"
                  placeholder="12345"
                  aria-invalid={!!errors.address?.zip}
                  {...register('address.zip')}
                />
              </FormField>

              <FormField
                label="Country"
                error={errors.address?.country?.message}
                isTouched={!!touchedFields.address?.country}
              >
                <Input
                  id="address.country"
                  type="text"
                  placeholder="Country"
                  aria-invalid={!!errors.address?.country}
                  {...register('address.country')}
                />
              </FormField>
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="subtle"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="bold"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? mode === 'create'
              ? 'Adding...'
              : 'Saving...'
            : mode === 'create'
              ? 'Add Contributor'
              : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}

/**
 * Internal field wrapper with label, error state, and validation icons.
 */
function FormField({
  label,
  error,
  isTouched,
  required,
  children,
  className = '',
}: {
  label: string
  error?: string
  isTouched: boolean
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  const isValid = isTouched && !error

  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="flex items-center gap-2">
        {label}
        {required && <span className="text-red" aria-hidden="true">*</span>}
        {isValid && (
          <CircleCheck className="h-4 w-4 text-green" aria-hidden="true" />
        )}
      </Label>
      <div className="relative">
        {children}
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <CircleAlert className="h-5 w-5 text-red" aria-hidden="true" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
