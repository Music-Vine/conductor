'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import * as Tabs from '@radix-ui/react-tabs'
import type { Contributor, ContributorPayee } from '@/types'
import { ProfileTab } from './ProfileTab'
import { PayeesTab } from './PayeesTab'
import { AssetsTab } from './AssetsTab'
import type { ContributorAssetListItem } from './AssetsTab'

interface ContributorDetailTabsProps {
  contributor: Contributor
  payees: ContributorPayee[]
  assets: ContributorAssetListItem[]
  activeTab: string
}

/**
 * Tabbed navigation for contributor detail sections.
 * Syncs tab selection with URL search params.
 */
export function ContributorDetailTabs({
  contributor,
  payees,
  assets,
  activeTab,
}: ContributorDetailTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  /**
   * Handle tab change by updating URL with ?tab=X
   */
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'profile') {
      // Remove tab param for default tab
      params.delete('tab')
    } else {
      params.set('tab', value)
    }

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.push(newUrl)
  }

  return (
    <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
      {/* Tab list */}
      <Tabs.List className="flex border-b border-gray-200">
        <Tabs.Trigger
          value="profile"
          className="px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900"
        >
          Profile
        </Tabs.Trigger>
        <Tabs.Trigger
          value="payees"
          className="px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900"
        >
          Payees
        </Tabs.Trigger>
        <Tabs.Trigger
          value="assets"
          className="px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900"
        >
          Assets
        </Tabs.Trigger>
      </Tabs.List>

      {/* Tab content */}
      <div className="mt-6">
        <Tabs.Content value="profile" className="outline-none">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <ProfileTab contributor={contributor} />
          </div>
        </Tabs.Content>

        <Tabs.Content value="payees" className="outline-none">
          <PayeesTab contributorId={contributor.id} payees={payees} />
        </Tabs.Content>

        <Tabs.Content value="assets" className="outline-none">
          <AssetsTab assets={assets} />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  )
}
