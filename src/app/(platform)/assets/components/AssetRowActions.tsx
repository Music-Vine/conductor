'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@music-vine/cadence/ui'
import type { AssetListItem } from '@/types/asset'

interface AssetRowActionsProps {
  asset: AssetListItem
}

/**
 * Row actions dropdown for asset table.
 * Shows contextual actions based on asset status.
 */
export function AssetRowActions({ asset }: AssetRowActionsProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleViewDetails = () => {
    router.push(`/assets/${asset.id}`)
  }

  const isPublished = asset.status === 'published'

  return (
    <div className="relative" data-actions>
      <Button
        variant="subtle"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewDetails()
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                View Details
              </button>

              {isPublished && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // Navigate to detail page where unpublish action exists
                    router.push(`/assets/${asset.id}`)
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Unpublish
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
