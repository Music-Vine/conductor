'use client'

import { UserMenu } from './UserMenu'

interface HeaderProps {
  title?: string
  userName: string
  userEmail: string
}

export function Header({ title, userName, userEmail }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        {title && (
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h1>
        )}
      </div>
      <UserMenu name={userName} email={userEmail} />
    </header>
  )
}
