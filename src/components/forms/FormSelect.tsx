'use client'

import { useFormContext } from 'react-hook-form'
import { FormField } from './FormField'

interface FormSelectOption {
  value: string
  label: string
}

interface FormSelectProps {
  name: string
  label?: string
  options: FormSelectOption[]
  placeholder?: string
  description?: string
  disabled?: boolean
  className?: string
}

/**
 * Select input with form integration and validation styling.
 */
export function FormSelect({
  name,
  label,
  options,
  placeholder,
  description,
  disabled,
  className = '',
}: FormSelectProps) {
  const { register, formState: { errors } } = useFormContext()
  const hasError = !!errors[name]

  return (
    <FormField name={name} label={label} description={description} className={className}>
      <select
        id={name}
        disabled={disabled}
        aria-invalid={hasError}
        {...register(name)}
        className={`
          block w-full appearance-none rounded-lg border bg-white px-4 py-2.5 pr-10
          text-gray-900
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
          dark:bg-gray-800 dark:text-gray-100
          ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-gray-300 focus:border-gray-500 focus:ring-gray-500/20 dark:border-gray-700 dark:focus:border-gray-400'
          }
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  )
}
