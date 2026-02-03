'use client'

import { useFormContext } from 'react-hook-form'
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
    getFieldState,
  } = useFormContext()

  const fieldState = getFieldState(name)
  const error = errors[name]
  const isTouched = touchedFields[name]
  const isValid = isTouched && !error

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {label}
          {/* Valid checkmark */}
          {isValid && (
            <svg
              className="h-4 w-4 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </label>
      )}
      {description && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      )}
      <div className="relative">
        {children}
        {/* Error icon (absolute positioned in input) */}
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-5 w-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error.message as string}
        </p>
      )}
    </div>
  )
}
