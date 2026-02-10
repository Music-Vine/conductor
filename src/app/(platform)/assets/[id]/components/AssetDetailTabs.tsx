'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import * as Tabs from '@radix-ui/react-tabs'
import type { Asset } from '@/types/asset'
import { OverviewTab } from './OverviewTab'
import { WorkflowTab } from './WorkflowTab'
import { CollectionsTab } from './CollectionsTab'
import { ActivityTab } from './ActivityTab'

interface AssetDetailTabsProps {
  asset: Asset
  currentTab: string
}

export function AssetDetailTabs({ asset, currentTab }: AssetDetailTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'overview') {
      params.delete('tab')
    } else {
      params.set('tab', value)
    }
    const query = params.toString()
    const newUrl = query ? `${pathname}?${query}` : pathname
    router.push(newUrl)
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'collections', label: 'Collections' },
    { id: 'activity', label: 'Activity' },
  ]

  return (
    <Tabs.Root value={currentTab} onValueChange={handleTabChange}>
      <Tabs.List className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.id}
            value={tab.id}
            className={`
              px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
              ${currentTab === tab.id
                ? 'border-platform-primary text-platform-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <div className="mt-6">
        <Tabs.Content value="overview">
          <OverviewTab asset={asset} />
        </Tabs.Content>
        <Tabs.Content value="workflow">
          <WorkflowTab asset={asset} />
        </Tabs.Content>
        <Tabs.Content value="collections">
          <CollectionsTab asset={asset} />
        </Tabs.Content>
        <Tabs.Content value="activity">
          <ActivityTab asset={asset} />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  )
}
