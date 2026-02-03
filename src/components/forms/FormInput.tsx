'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@music-vine/cadence/ui'
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
 * Text input with form integration using Cadence Input primitive.
 * Validation styling is handled by Cadence via aria-invalid attribute.
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
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={hasError}
        {...register(name)}
      />
    </FormField>
  )
}
