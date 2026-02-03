'use client'

import {
  FormProvider,
  useForm,
  type UseFormReturn,
  type FieldValues,
  type SubmitHandler,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import type { ReactNode } from 'react'

interface FormProps<T extends FieldValues> {
  schema: z.ZodType<T>
  defaultValues?: Partial<T>
  onSubmit: SubmitHandler<T>
  children: ReactNode
  className?: string
}

/**
 * Form wrapper that integrates React Hook Form with Zod validation.
 *
 * Per CONTEXT.md:
 * - Validates on blur (mode: 'onBlur')
 * - Re-validates on change after first error (reValidateMode: 'onChange')
 *
 * @example
 * <Form schema={userSchema} defaultValues={{ email: '' }} onSubmit={handleSubmit}>
 *   <FormInput name="email" label="Email" type="email" />
 *   <button type="submit">Submit</button>
 * </Form>
 */
export function Form<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className = '',
}: FormProps<T>) {
  const methods = useForm<T>({
    // Type assertion needed due to generic constraint limitations with zodResolver
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as any,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: defaultValues as any,
  })

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit as any)}
        className={className}
        noValidate // Use Zod validation, not browser validation
      >
        {children}
      </form>
    </FormProvider>
  )
}
