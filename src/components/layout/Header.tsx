'use client'

import { UserMenu } from './UserMenu'

interface HeaderProps {
  title?: string
  userName: string
  userEmail: string
}

export function Header({ title, userName, userEmail }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900">
      <div>
        {title && (
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
        )}
      </div>
      <UserMenu name={userName} email={userEmail} />
    </header>
  )
}
