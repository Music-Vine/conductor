'use client'

import { useFormContext } from 'react-hook-form'
import { Textarea } from '@music-vine/cadence/ui'
import { FormField } from './FormField'

interface FormTextareaProps {
  name: string
  label?: string
  placeholder?: string
  description?: string
  disabled?: boolean
  rows?: number
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  className?: string
}

/**
 * Textarea with form integration using Cadence Textarea primitive.
 * Validation styling is handled by Cadence via aria-invalid attribute.
 */
export function FormTextarea({
  name,
  label,
  placeholder,
  description,
  disabled,
  rows = 4,
  resize = 'none',
  className = '',
}: FormTextareaProps) {
  const { register, formState: { errors } } = useFormContext()
  const hasError = !!errors[name]

  return (
    <FormField name={name} label={label} description={description} className={className}>
      <Textarea
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        resize={resize}
        aria-invalid={hasError}
        {...register(name)}
      />
    </FormField>
  )
}
