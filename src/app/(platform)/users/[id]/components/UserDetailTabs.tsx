'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import * as Tabs from '@radix-ui/react-tabs'
import type { UserDetail } from '@/types'

interface UserDetailTabsProps {
  user: UserDetail
  activeTab: string
}

/**
 * Tabbed navigation for user detail sections.
 * Syncs tab selection with URL search params.
 */
export function UserDetailTabs({ user, activeTab }: UserDetailTabsProps) {
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
          value="subscription"
          className="px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900"
        >
          Subscription
        </Tabs.Trigger>
        <Tabs.Trigger
          value="downloads"
          className="px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900"
        >
          Downloads + Licenses
        </Tabs.Trigger>
      </Tabs.List>

      {/* Tab content */}
      <div className="mt-6">
        <Tabs.Content value="profile" className="outline-none">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-gray-700">Profile content</p>
          </div>
        </Tabs.Content>

        <Tabs.Content value="subscription" className="outline-none">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-gray-700">Subscription content</p>
          </div>
        </Tabs.Content>

        <Tabs.Content value="downloads" className="outline-none">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-gray-700">Downloads content</p>
          </div>
        </Tabs.Content>
      </div>
    </Tabs.Root>
  )
}
