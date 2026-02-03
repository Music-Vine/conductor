import { z } from 'zod'

/**
 * Common validation schemas for reuse across forms.
 */

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  )

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')

export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .or(z.literal('')) // Allow empty string

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
  .or(z.literal(''))

/**
 * Helper to make a schema optional (allows empty string).
 */
export function optional<T extends z.ZodTypeAny>(schema: T) {
  return schema.or(z.literal(''))
}

/**
 * Confirmation field helper (e.g., password confirmation).
 */
export function confirmationSchema<T extends z.ZodString>(
  schema: T,
  fieldName: string,
  confirmFieldName: string,
  message = `${fieldName} and ${confirmFieldName} must match`
) {
  return z
    .object({
      [fieldName]: schema,
      [confirmFieldName]: z.string(),
    })
    .refine((data) => data[fieldName] === data[confirmFieldName], {
      message,
      path: [confirmFieldName],
    })
}

/**
 * Example user schema combining multiple fields.
 */
export const userFormSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  role: z.enum(['admin', 'editor', 'viewer'], {
    message: 'Please select a role',
  }),
})

export type UserFormData = z.infer<typeof userFormSchema>
