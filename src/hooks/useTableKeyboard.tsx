'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useShortcutScope } from './useKeyboardShortcuts'

interface UseTableKeyboardOptions<T> {
  items: T[]
  onNavigate?: (item: T, index: number) => void
  onSelect?: (selectedItems: T[], indices: number[]) => void
  onAction?: (item: T) => void  // Called on Enter
  enabled?: boolean
}

interface UseTableKeyboardReturn<T> {
  focusedIndex: number
  selectedIndices: Set<number>
  tableRef: React.RefObject<HTMLDivElement | null>
  isFocused: boolean
  setFocusedIndex: (index: number) => void
  clearSelection: () => void
  selectAll: () => void
  toggleSelection: (index: number) => void
}

export function useTableKeyboard<T>({
  items,
  onNavigate,
  onSelect,
  onAction,
  enabled = true,
}: UseTableKeyboardOptions<T>): UseTableKeyboardReturn<T> {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
  const [isFocused, setIsFocused] = useState(false)
  const tableRef = useRef<HTMLDivElement | null>(null)
  const { activate, deactivate } = useShortcutScope('table')

  // Track focus state
  useEffect(() => {
    const element = tableRef.current
    if (!element) return

    const handleFocus = () => {
      setIsFocused(true)
      activate()
    }
    const handleBlur = (e: FocusEvent) => {
      // Only deactivate if focus is leaving the table entirely
      if (!element.contains(e.relatedTarget as Node)) {
        setIsFocused(false)
        deactivate()
      }
    }

    element.addEventListener('focus', handleFocus)
    element.addEventListener('blur', handleBlur)
    return () => {
      element.removeEventListener('focus', handleFocus)
      element.removeEventListener('blur', handleBlur)
    }
  }, [activate, deactivate])

  // Helper functions
  const toggleSelection = useCallback((index: number) => {
    setSelectedIndices(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIndices(new Set())
    setFocusedIndex(-1)
    onSelect?.([], [])
  }, [onSelect])

  const selectAll = useCallback(() => {
    const allIndices = new Set(items.map((_, i) => i))
    setSelectedIndices(allIndices)
    onSelect?.(items, Array.from(allIndices))
  }, [items, onSelect])

  const notifySelection = useCallback(() => {
    const indices = Array.from(selectedIndices)
    const selectedItems = indices.map(i => items[i])
    onSelect?.(selectedItems, indices)
  }, [selectedIndices, items, onSelect])

  // Navigate down (j)
  useHotkeys('j', () => {
    if (!enabled || !isFocused || items.length === 0) return
    const newIndex = focusedIndex < 0 ? 0 : Math.min(focusedIndex + 1, items.length - 1)
    setFocusedIndex(newIndex)
    onNavigate?.(items[newIndex], newIndex)
  }, {
    enabled: enabled && isFocused,
    preventDefault: true,
  }, [items, focusedIndex, enabled, isFocused, onNavigate])

  // Navigate up (k)
  useHotkeys('k', () => {
    if (!enabled || !isFocused || items.length === 0) return
    const newIndex = focusedIndex < 0 ? 0 : Math.max(focusedIndex - 1, 0)
    setFocusedIndex(newIndex)
    onNavigate?.(items[newIndex], newIndex)
  }, {
    enabled: enabled && isFocused,
    preventDefault: true,
  }, [items, focusedIndex, enabled, isFocused, onNavigate])

  // Toggle selection (Space)
  useHotkeys('space', () => {
    if (!enabled || !isFocused || focusedIndex < 0) return
    toggleSelection(focusedIndex)
  }, {
    enabled: enabled && isFocused,
    preventDefault: true,
  }, [focusedIndex, enabled, isFocused, toggleSelection])

  // Extend selection down (Shift+j)
  useHotkeys('shift+j', () => {
    if (!enabled || !isFocused || items.length === 0) return
    const newIndex = focusedIndex < 0 ? 0 : Math.min(focusedIndex + 1, items.length - 1)
    setFocusedIndex(newIndex)
    setSelectedIndices(prev => {
      const next = new Set(prev)
      next.add(newIndex)
      return next
    })
  }, {
    enabled: enabled && isFocused,
    preventDefault: true,
  }, [items, focusedIndex, enabled, isFocused])

  // Extend selection up (Shift+k)
  useHotkeys('shift+k', () => {
    if (!enabled || !isFocused || items.length === 0) return
    const newIndex = focusedIndex < 0 ? 0 : Math.max(focusedIndex - 1, 0)
    setFocusedIndex(newIndex)
    setSelectedIndices(prev => {
      const next = new Set(prev)
      next.add(newIndex)
      return next
    })
  }, {
    enabled: enabled && isFocused,
    preventDefault: true,
  }, [items, focusedIndex, enabled, isFocused])

  // Select all (Cmd+A)
  useHotkeys('mod+a', (e) => {
    if (!enabled || !isFocused) return
    e.preventDefault()
    selectAll()
  }, {
    enabled: enabled && isFocused,
    preventDefault: true,
  }, [items, enabled, isFocused, selectAll])

  // Open action (Enter)
  useHotkeys('enter', () => {
    if (!enabled || !isFocused || focusedIndex < 0) return
    onAction?.(items[focusedIndex])
  }, {
    enabled: enabled && isFocused,
    preventDefault: true,
  }, [items, focusedIndex, enabled, isFocused, onAction])

  // Clear selection (Escape)
  useHotkeys('escape', () => {
    if (!enabled || !isFocused) return
    clearSelection()
  }, {
    enabled: enabled && isFocused,
    preventDefault: true,
  }, [enabled, isFocused, clearSelection])

  // Notify on selection change
  useEffect(() => {
    notifySelection()
  }, [selectedIndices]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    focusedIndex,
    selectedIndices,
    tableRef,
    isFocused,
    setFocusedIndex,
    clearSelection,
    selectAll,
    toggleSelection,
  }
}
