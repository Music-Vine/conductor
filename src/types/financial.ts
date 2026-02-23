/**
 * Contributor account status.
 */
export type ContributorStatus = 'active' | 'inactive' | 'pending'

/**
 * Payee account status.
 */
export type PayeeStatus = 'active' | 'inactive'

/**
 * Payment method options for payees.
 */
export type PaymentMethod = 'ach' | 'wire' | 'check' | 'paypal'

/**
 * Full contributor entity representing a content creator.
 */
export interface Contributor {
  id: string
  name: string
  email: string
  phone?: string
  /** Masked EIN or SSN for tax purposes. */
  taxId?: string
  address?: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  status: ContributorStatus
  /** Count of assets associated with this contributor. */
  totalAssets: number
  /** Count of payees assigned to this contributor. */
  totalPayees: number
  createdAt: string
  updatedAt: string
}

/**
 * Simplified contributor for table display.
 */
export interface ContributorListItem {
  id: string
  name: string
  email: string
  status: ContributorStatus
  totalAssets: number
  totalPayees: number
  createdAt: string
}

/**
 * Contributor search and filter parameters.
 */
export interface ContributorSearchParams {
  query?: string
  status?: ContributorStatus
  page?: number
  limit?: number
}

/**
 * Full payee entity representing a payment recipient.
 */
export interface Payee {
  id: string
  name: string
  email: string
  phone?: string
  /** Tax identifier (EIN or SSN). */
  taxId?: string
  paymentMethod: PaymentMethod
  paymentDetails: {
    accountNumber?: string
    routingNumber?: string
    paypalEmail?: string
  }
  address?: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  status: PayeeStatus
  /** Count of contributors assigned to this payee. */
  totalContributors: number
  createdAt: string
  updatedAt: string
}

/**
 * Simplified payee for table display.
 */
export interface PayeeListItem {
  id: string
  name: string
  email: string
  paymentMethod: PaymentMethod
  status: PayeeStatus
  totalContributors: number
  createdAt: string
}

/**
 * Payee search and filter parameters.
 */
export interface PayeeSearchParams {
  query?: string
  status?: PayeeStatus
  paymentMethod?: PaymentMethod
  page?: number
  limit?: number
}

/**
 * Junction table type representing the many-to-many relationship between
 * a contributor and a payee, with percentage rate metadata.
 */
export interface ContributorPayee {
  contributorId: string
  payeeId: string
  payeeName: string
  payeeEmail: string
  paymentMethod: PaymentMethod
  /** Integer percentage (0-100) representing the payee's share of royalties. */
  percentageRate: number
  /** ISO date string for when this rate became effective. */
  effectiveDate: string
  notes?: string
  createdAt: string
  updatedAt: string
}

/**
 * Combined view for displaying a contributor-payee relationship.
 */
export interface ContributorPayeeRelationship {
  /** Composite key: contributorId-payeeId */
  id: string
  contributor: Contributor
  payee: Payee
  percentageRate: number
  effectiveDate: string
  notes?: string
}

/**
 * Flat structure for CSV export to accounting systems.
 */
export interface FinancialExportRow {
  contributorId: string
  contributorName: string
  contributorEmail: string
  contributorStatus: ContributorStatus
  payeeId: string
  payeeName: string
  payeeEmail: string
  payeePaymentMethod: PaymentMethod
  payeeStatus: PayeeStatus
  /** Integer percentage (0-100). */
  percentageRate: number
  effectiveDate: string
  createdAt: string
  updatedAt: string
}
