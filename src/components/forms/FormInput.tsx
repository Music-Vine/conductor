'use client'

import { useFormContext } from 'react-hook-form'
import { FormField } from './FormField'

interface FormInputProps {
  name: string
  label?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  description?: string
  disabled?: boolean
  autoComplete?: string
  className?: string
}

/**
 * Text input with form integration and validation styling.
 */
export function FormInput({
  name,
  label,
  type = 'text',
  placeholder,
  description,
  disabled,
  autoComplete,
  className = '',
}: FormInputProps) {
  const { register, formState: { errors } } = useFormContext()
  const hasError = !!errors[name]

  return (
    <FormField name={name} label={label} description={description} className={className}>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={hasError}
        {...register(name)}
        className={`
          block w-full rounded-lg border px-4 py-2.5 pr-10
          text-zinc-900 placeholder:text-zinc-400
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500
          dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500
          ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500/20 dark:border-zinc-700 dark:focus:border-zinc-400'
          }
        `}
      />
    </FormField>
  )
}
