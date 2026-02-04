'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useRouter } from 'next/navigation'
import type { UserListItem } from '@/types/user'
import { SuspendUserDialog } from '../[id]/components/SuspendUserDialog'
import { useState } from 'react'

interface UserRowActionsProps {
  user: UserListItem
}

/**
 * Row actions dropdown for user table.
 *
 * Provides quick access to common operations without full navigation.
 * Per CONTEXT.md: "Actions menu provides quick access to common operations"
 */
export function UserRowActions({ user }: UserRowActionsProps) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <DropdownMenu.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
          aria-label="More actions"
        >
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <circle cx="10" cy="4" r="1.5" />
            <circle cx="10" cy="10" r="1.5" />
            <circle cx="10" cy="16" r="1.5" />
          </svg>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[200px] rounded-md border border-gray-200 bg-white p-1 shadow-lg"
          sideOffset={5}
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu.Item
            className="flex cursor-pointer items-center rounded px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 focus:bg-gray-100"
            onSelect={() => {
              router.push(`/users/${user.id}`)
            }}
          >
            View Details
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />

          <DropdownMenu.Item
            className="flex cursor-pointer items-center rounded px-3 py-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
            onSelect={(e) => {
              // Prevent default behavior to keep dropdown open for nested dialog
              e.preventDefault()
            }}
            asChild
          >
            <div>
              <SuspendUserDialog
                userId={user.id}
                userEmail={user.email}
                currentStatus={user.status}
                trigger={
                  <button
                    className={`w-full text-left ${
                      user.status === 'active' ? 'text-red-600' : 'text-gray-700'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setDropdownOpen(false)
                    }}
                  >
                    {user.status === 'active'
                      ? 'Suspend Account'
                      : 'Unsuspend Account'}
                  </button>
                }
              />
            </div>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex cursor-pointer items-center rounded px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 focus:bg-gray-100"
            onSelect={() => {
              router.push(`/users/${user.id}?tab=profile&action=disconnect-oauth`)
            }}
          >
            Disconnect OAuth
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
