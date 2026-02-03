'use client'

import { useFormContext } from 'react-hook-form'
import { Label } from '@music-vine/cadence/ui'
import { CircleCheck, CircleAlert } from '@music-vine/cadence/icons'
import type { ReactNode } from 'react'

interface FormFieldProps {
  name: string
  label?: string
  description?: string
  children: ReactNode
  className?: string
}

/**
 * Field wrapper that provides label, error message, and validation state.
 * Uses Cadence Label for accessible labeling and Cadence icons for feedback.
 *
 * Per CONTEXT.md:
 * - Error messages appear inline below field
 * - Red border + error icon on invalid fields
 * - Green checkmark on valid fields (when touched and valid)
 */
export function FormField({
  name,
  label,
  description,
  children,
  className = '',
}: FormFieldProps) {
  const {
    formState: { errors, touchedFields },
  } = useFormContext()

  const error = errors[name]
  const isTouched = touchedFields[name]
  const isValid = isTouched && !error

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <Label
          htmlFor={name}
          className="flex items-center gap-2"
        >
          {label}
          {/* Valid checkmark */}
          {isValid && (
            <CircleCheck
              className="h-4 w-4 text-green"
              aria-hidden="true"
            />
          )}
        </Label>
      )}
      {description && (
        <p className="text-sm text-gray-700 dark:text-gray-300">{description}</p>
      )}
      <div className="relative">
        {children}
        {/* Error icon (absolute positioned in input) */}
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <CircleAlert
              className="h-5 w-5 text-red"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      {/* Error message */}
      {error && (
        <p className="text-sm text-red" role="alert">
          {error.message as string}
        </p>
      )}
    </div>
  )
}
