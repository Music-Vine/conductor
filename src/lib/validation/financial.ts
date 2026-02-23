import { z } from 'zod'

/**
 * Address sub-schema for contributor and payee entities.
 */
const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
})

/**
 * Validates contributor creation and edit operations.
 */
export const contributorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  taxId: z.string().optional(),
  address: addressSchema.optional(),
})

export type ContributorFormData = z.infer<typeof contributorSchema>

/**
 * Validates payee creation and edit operations.
 */
export const payeeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  taxId: z.string().optional(),
  paymentMethod: z.enum(['ach', 'wire', 'check', 'paypal'], {
    message: 'Please select a valid payment method',
  }),
  paymentDetails: z
    .object({
      accountNumber: z.string().optional(),
      routingNumber: z.string().optional(),
      paypalEmail: z.string().optional(),
    })
    .optional(),
  address: addressSchema.optional(),
})

export type PayeeFormData = z.infer<typeof payeeSchema>

/**
 * Validates an individual payee rate assignment.
 * Percentage rates are stored as integers (0-100) to avoid floating-point
 * arithmetic errors (e.g. 0.1 + 0.2 !== 0.3).
 */
export const percentageRateSchema = z.object({
  payeeId: z.string().min(1, 'Payee is required'),
  percentageRate: z
    .number()
    .int('Must be a whole number')
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot exceed 100'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  notes: z.string().optional(),
})

export type PercentageRateFormData = z.infer<typeof percentageRateSchema>

/**
 * Validates the full payee assignment for a contributor.
 * Enforces that all percentage rates sum to exactly 100%.
 */
export const contributorPayeesSchema = z.object({
  contributorId: z.string(),
  payees: z
    .array(percentageRateSchema)
    .min(1, 'At least one payee required')
    .refine(
      (payees) => {
        const sum = payees.reduce((acc, p) => acc + p.percentageRate, 0)
        return sum === 100
      },
      {
        message: 'Payee percentages must sum to exactly 100%',
      }
    ),
})

export type ContributorPayeesFormData = z.infer<typeof contributorPayeesSchema>

/**
 * Calculates the remaining percentage to allocate across payees.
 * Returns a value between 0 and 100 (never negative).
 */
export function calculateRemainingPercentage(
  rates: Array<{ percentageRate: number }>
): number {
  const sum = rates.reduce((acc, r) => acc + r.percentageRate, 0)
  return Math.max(0, 100 - sum)
}

/**
 * Returns a human-readable message describing the current allocation state.
 * Returns an empty string when fully allocated (sum === 100).
 *
 * @example
 * formatPercentageError([{ percentageRate: 80 }])
 * // "Total is 80%. Please assign the remaining 20%."
 *
 * formatPercentageError([{ percentageRate: 110 }])
 * // "Total is 110%. Please reduce by 10%."
 */
export function formatPercentageError(
  rates: Array<{ percentageRate: number }>
): string {
  const sum = rates.reduce((acc, r) => acc + r.percentageRate, 0)
  if (sum < 100) {
    return `Total is ${sum}%. Please assign the remaining ${100 - sum}%.`
  }
  if (sum > 100) {
    return `Total is ${sum}%. Please reduce by ${sum - 100}%.`
  }
  return ''
}
