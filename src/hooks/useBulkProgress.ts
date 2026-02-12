'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import type { ProgressEvent, ErrorEvent, CompleteEvent } from '@/lib/bulk-operations/sse'

export interface BulkProgressState {
  isRunning: boolean
  processed: number
  total: number
  percentage: number
  currentItem: string | null
  estimatedSecondsRemaining: number | null
  error: string | null
  operationId: string | null
}

export interface UseBulkProgressReturn {
  state: BulkProgressState
  startOperation: (endpoint: string, body: { action: string; ids: string[]; payload?: object }) => Promise<{
    success: boolean
    operationId?: string
    error?: string
  }>
  isRunning: boolean
}

export function useBulkProgress(): UseBulkProgressReturn {
  const [state, setState] = useState<BulkProgressState>({
    isRunning: false,
    processed: 0,
    total: 0,
    percentage: 0,
    currentItem: null,
    estimatedSecondsRemaining: null,
    error: null,
    operationId: null,
  })

  const toastIdRef = useRef<string | number | undefined>(undefined)

  const formatTimeRemaining = (seconds: number | null): string => {
    if (seconds === null) return ''
    if (seconds < 60) return `~${seconds}s remaining`
    const minutes = Math.ceil(seconds / 60)
    return `~${minutes} minute${minutes > 1 ? 's' : ''} remaining`
  }

  const startOperation = useCallback(async (
    endpoint: string,
    body: { action: string; ids: string[]; payload?: object }
  ) => {
    return new Promise<{ success: boolean; operationId?: string; error?: string }>((resolve) => {
      // Reset state
      setState({
        isRunning: true,
        processed: 0,
        total: body.ids.length,
        percentage: 0,
        currentItem: null,
        estimatedSecondsRemaining: null,
        error: null,
        operationId: null,
      })

      // Show initial toast
      toastIdRef.current = toast.loading(
        `Starting ${body.action} operation on ${body.ids.length} items...`
      )

      // Make POST request to start SSE stream
      fetch(`/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(response => {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          toast.error('Failed to start operation', { id: toastIdRef.current })
          setState(prev => ({ ...prev, isRunning: false, error: 'No response stream' }))
          resolve({ success: false, error: 'No response stream' })
          return
        }

        const processStream = async () => {
          let buffer = ''

          while (true) {
            const { done, value } = await reader.read()

            if (done) break

            buffer += decoder.decode(value, { stream: true })

            // Process complete SSE events (terminated by \n\n)
            const events = buffer.split('\n\n')
            buffer = events.pop() || '' // Keep incomplete event in buffer

            for (const eventStr of events) {
              if (!eventStr.startsWith('data: ')) continue
              const data = JSON.parse(eventStr.slice(6))

              if (data.type === 'progress') {
                const { processed, total, percentage, currentItem, estimatedSecondsRemaining } = data as ProgressEvent
                setState(prev => ({
                  ...prev,
                  processed,
                  total,
                  percentage,
                  currentItem,
                  estimatedSecondsRemaining,
                }))

                // Update toast with progress
                const timeStr = formatTimeRemaining(estimatedSecondsRemaining)
                toast.loading(
                  `Processing ${processed} of ${total} items... (${percentage}%)${timeStr ? ` ${timeStr}` : ''}`,
                  { id: toastIdRef.current, description: currentItem ? `Current: ${currentItem}` : undefined }
                )
              }

              if (data.type === 'error') {
                const { message, processed, total, failedItem } = data as ErrorEvent
                setState(prev => ({
                  ...prev,
                  isRunning: false,
                  error: message,
                }))
                toast.error(`Operation failed after ${processed} of ${total} items`, {
                  id: toastIdRef.current,
                  description: `Error on ${failedItem}: ${message}`,
                })
                resolve({ success: false, error: message })
                return
              }

              if (data.type === 'complete') {
                const { processed, total, operationId } = data as CompleteEvent
                setState(prev => ({
                  ...prev,
                  isRunning: false,
                  processed,
                  operationId,
                }))
                toast.success(`Successfully processed ${total} items`, { id: toastIdRef.current })
                resolve({ success: true, operationId })
                return
              }
            }
          }
        }

        processStream().catch(error => {
          toast.error('Connection lost', { id: toastIdRef.current })
          setState(prev => ({ ...prev, isRunning: false, error: 'Connection lost' }))
          resolve({ success: false, error: 'Connection lost' })
        })

      }).catch(error => {
        toast.error('Failed to start operation', { id: toastIdRef.current })
        setState(prev => ({ ...prev, isRunning: false, error: error.message }))
        resolve({ success: false, error: error.message })
      })
    })
  }, [])

  return {
    state,
    startOperation,
    isRunning: state.isRunning,
  }
}
