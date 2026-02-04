'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual'
import type { Table, Row } from '@tanstack/react-table'

interface UseVirtualizedTableOptions<T> {
  table: Table<T>
  rowHeight?: number
  overscan?: number
  containerHeight?: number
}

interface UseVirtualizedTableReturn<T> {
  parentRef: React.RefObject<HTMLDivElement | null>
  virtualRows: VirtualItem[]
  totalHeight: number
  rows: Row<T>[]
  scrollToTop: () => void
  scrollToIndex: (index: number) => void
}

// Default row height - fixed per CONTEXT decision for simpler/faster rendering
const DEFAULT_ROW_HEIGHT = 52

export function useVirtualizedTable<T>({
  table,
  rowHeight = DEFAULT_ROW_HEIGHT,
  overscan = 10,
  containerHeight = 600,
}: UseVirtualizedTableOptions<T>): UseVirtualizedTableReturn<T> {
  const parentRef = useRef<HTMLDivElement | null>(null)

  // Get rows from table
  const { rows } = table.getRowModel()

  // Create virtualizer
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalHeight = rowVirtualizer.getTotalSize()

  // Scroll utilities
  const scrollToTop = () => {
    rowVirtualizer.scrollToIndex(0, { align: 'start' })
  }

  const scrollToIndex = (index: number) => {
    rowVirtualizer.scrollToIndex(index, { align: 'center' })
  }

  return {
    parentRef,
    virtualRows,
    totalHeight,
    rows,
    scrollToTop,
    scrollToIndex,
  }
}

// Hook to manage scroll position based on filter/sort state
export function useSmartScrollReset<T>(
  virtualizedTable: UseVirtualizedTableReturn<T>,
  dependencies: unknown[] // Array of filter/sort state values
) {
  const { scrollToTop, parentRef } = virtualizedTable
  const previousScrollTop = useRef(0)
  const isFirstRender = useRef(true)

  // Reset scroll to top when filters/sorts change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    scrollToTop()
  }, dependencies) // eslint-disable-line react-hooks/exhaustive-deps

  // Save scroll position before data changes (for refresh preservation)
  useEffect(() => {
    const element = parentRef.current
    if (!element) return

    const handleScroll = () => {
      previousScrollTop.current = element.scrollTop
    }

    element.addEventListener('scroll', handleScroll, { passive: true })
    return () => element.removeEventListener('scroll', handleScroll)
  }, [parentRef])

  // Restore scroll position on browser back navigation
  useEffect(() => {
    const handlePopState = () => {
      const element = parentRef.current
      if (element && previousScrollTop.current > 0) {
        element.scrollTop = previousScrollTop.current
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [parentRef])

  return {
    savedScrollPosition: previousScrollTop.current,
  }
}

// Component for rendering a virtualized row with absolute positioning
export interface VirtualizedRowProps {
  virtualRow: VirtualItem
  children: React.ReactNode
  className?: string
}

export function VirtualizedRow({ virtualRow, children, className = '' }: VirtualizedRowProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: `${virtualRow.size}px`,
        transform: `translateY(${virtualRow.start}px)`,
      }}
      className={className}
    >
      {children}
    </div>
  )
}

// Constants export for consumers
export const VIRTUALIZED_TABLE_DEFAULTS = {
  rowHeight: DEFAULT_ROW_HEIGHT,
  overscan: 10,
  containerHeight: 600,
} as const
