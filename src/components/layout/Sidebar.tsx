'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PlatformToggle } from '@/components/PlatformToggle'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  children?: NavItem[]
}

interface SidebarProps {
  userId?: string // For audit logging platform switches
}

// Navigation items with collapsible sections
const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Users',
    href: '/users',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: 'Assets',
    href: '/assets',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    children: [
      { label: 'Music', href: '/assets/music', icon: null },
      { label: 'SFX', href: '/assets/sfx', icon: null },
      { label: 'Motion Graphics', href: '/assets/motion-graphics', icon: null },
      { label: 'LUTs', href: '/assets/luts', icon: null },
      { label: 'Stock Footage', href: '/assets/stock-footage', icon: null },
    ],
  },
  {
    label: 'Collections',
    href: '/collections',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    label: 'Contributors',
    href: '/contributors',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
]

function NavItemComponent({ item, pathname }: { item: NavItem; pathname: string }) {
  const [isOpen, setIsOpen] = useState(() => {
    // Auto-expand if any child is active
    if (item.children) {
      return item.children.some((child) => pathname.startsWith(child.href))
    }
    return false
  })

  const isActive = pathname === item.href || (item.children && pathname.startsWith(item.href + '/'))
  const hasChildren = item.children && item.children.length > 0

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
            transition-colors
            ${
              isActive
                ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }
          `}
        >
          {item.icon}
          <span className="flex-1 text-left">{item.label}</span>
          <svg
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {isOpen && (
          <div className="ml-8 mt-1 space-y-1">
            {item.children!.map((child) => {
              const isChildActive = pathname === child.href
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`
                    block rounded-lg px-3 py-1.5 text-sm
                    transition-colors
                    ${
                      isChildActive
                        ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                    }
                  `}
                >
                  {child.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      className={`
        flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
        transition-colors
        ${
          isActive
            ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
        }
      `}
    >
      {item.icon}
      {item.label}
    </Link>
  )
}

export function Sidebar({ userId }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen min-w-72 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {/* Platform indicator bar */}
      <div className="platform-indicator" />

      {/* Logo/Brand */}
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Conductor
          </span>
        </Link>
      </div>

      {/* Platform Toggle - userId enables audit logging for platform switches */}
      <div className="px-4 pb-4">
        <PlatformToggle className="w-full" userId={userId} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavItemComponent key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      {/* Footer area for future expansion */}
      <div className="p-4 text-xs text-gray-400 dark:text-gray-500">
        Conductor Admin v0.1
      </div>
    </aside>
  )
}
