'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Input } from '@music-vine/cadence'

interface InlineEditFieldProps {
  /** Current display value */
  value: string
  /** Async save handler — called on Enter key */
  onSave: (newValue: string) => Promise<void>
  /** React Query key for cache invalidation after a successful save */
  queryKey: unknown[]
  /** Input type (default: 'text') */
  type?: 'text' | 'number'
  /** Additional classes for the container element */
  className?: string
  /** Placeholder shown when value is empty */
  placeholder?: string
}

/**
 * InlineEditField — click-to-edit field component.
 *
 * State machine:
 *   idle      → click span → editing
 *   editing   → Enter      → saving → idle (success) | idle (error, restored)
 *   editing   → Escape     → idle (discarded, no save)
 *   editing   → blur       → (no-op — no accidental saves on blur)
 *   saving    → Escape     → (no-op — cannot cancel during pending save)
 */
export function InlineEditField({
  value,
  onSave,
  queryKey,
  type = 'text',
  className,
  placeholder,
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  // Keep display in sync when value prop changes externally — only when NOT editing
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value)
    }
  }, [value, isEditing])

  // Auto-focus and select all text when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const mutation = useMutation({
    mutationFn: () => onSave(localValue),
    onSuccess: () => {
      setIsEditing(false)
      queryClient.invalidateQueries({ queryKey })
      toast.success('Saved')
    },
    onError: () => {
      // Restore original value and exit edit mode
      setLocalValue(value)
      setIsEditing(false)
      toast.error('Failed to save')
    },
  })

  function handleClick() {
    setLocalValue(value)
    setIsEditing(true)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      mutation.mutate()
    } else if (e.key === 'Escape') {
      // Do not allow cancel during a pending save
      if (mutation.isPending) return
      setLocalValue(value)
      setIsEditing(false)
    }
  }

  // Blur does NOTHING — no accidental saves
  function handleBlur() {
    // Intentionally empty per CONTEXT decision:
    // "Enter to confirm, Escape to cancel — no accidental saves on blur."
  }

  if (isEditing) {
    return (
      <div className={className}>
        <Input
          ref={inputRef}
          type={type}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={mutation.isPending}
          placeholder={placeholder}
          className={mutation.isPending ? 'opacity-50' : ''}
          size="sm"
        />
      </div>
    )
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      className={[
        'inline-block cursor-text rounded px-1 py-0.5',
        'hover:bg-gray-100',
        'border border-transparent hover:border-dashed hover:border-gray-300',
        'transition-colors duration-100',
        'text-sm text-gray-900',
        !value && 'text-gray-400',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {value || placeholder || <span className="italic text-gray-400">—</span>}
    </span>
  )
}
