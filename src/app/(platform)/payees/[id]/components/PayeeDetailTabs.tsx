'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import * as Tabs from '@radix-ui/react-tabs'
import type { Payee } from '@/types'
import { PayeeProfileTab } from './PayeeProfileTab'
import { PayeeContributorsTab } from './PayeeContributorsTab'
import type { PayeeContributorEntry } from './PayeeContributorsTab'

interface PayeeDetailTabsProps {
  payee: Payee
  contributors: PayeeContributorEntry[]
  activeTab: string
}

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'contributors', label: 'Contributors' },
] as const

/**
 * Tabbed navigation for payee detail page.
 * Tab state is synced to URL search params for shareable links.
 */
export function PayeeDetailTabs({ payee, contributors, activeTab }: PayeeDetailTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleTabChange(tabId: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tabId)
    router.push(`?${params.toString()}`)
  }

  return (
    <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
      {/* Tab list */}
      <Tabs.List className="flex border-b border-gray-200">
        {TABS.map((tab) => (
          <Tabs.Trigger
            key={tab.id}
            value={tab.id}
            className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 transition-colors"
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {/* Tab content */}
      <div className="mt-6">
        <Tabs.Content value="profile">
          <PayeeProfileTab payee={payee} />
        </Tabs.Content>

        <Tabs.Content value="contributors">
          <PayeeContributorsTab contributors={contributors} />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  )
}
