'use client'

import { useState } from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { OAuthConnection } from '@/types'

interface OAuthConnectionsProps {
  userId: string
  connections: OAuthConnection[]
}

/**
 * Display OAuth connections with disconnect functionality.
 */
export function OAuthConnections({
  userId,
  connections,
}: OAuthConnectionsProps) {
  const [connectionToDisconnect, setConnectionToDisconnect] =
    useState<OAuthConnection | null>(null)
  const queryClient = useQueryClient()

  const disconnectMutation = useMutation({
    mutationFn: async (provider: 'google' | 'facebook') => {
      const response = await fetch(`/api/users/${userId}/disconnect-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect OAuth')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('OAuth connection disconnected successfully')
      // Invalidate user query to refresh data
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      setConnectionToDisconnect(null)
    },
    onError: () => {
      toast.error('Failed to disconnect OAuth connection')
    },
  })

  const handleDisconnect = () => {
    if (connectionToDisconnect) {
      disconnectMutation.mutate(connectionToDisconnect.provider)
    }
  }

  if (connections.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">No connected accounts</p>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {connections.map((connection) => (
          <div
            key={connection.provider}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center space-x-4">
              {/* Provider icon */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  connection.provider === 'google'
                    ? 'bg-blue-100'
                    : 'bg-blue-600'
                }`}
              >
                <span className="text-sm font-semibold text-white">
                  {connection.provider === 'google' ? 'G' : 'f'}
                </span>
              </div>

              {/* Connection details */}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {connection.provider === 'google' ? 'Google' : 'Facebook'}
                </p>
                <p className="text-sm text-gray-600">{connection.email}</p>
                <p className="text-xs text-gray-500">
                  Connected{' '}
                  {new Date(connection.connectedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Disconnect button */}
            <button
              type="button"
              onClick={() => setConnectionToDisconnect(connection)}
              className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Disconnect
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog.Root
        open={!!connectionToDisconnect}
        onOpenChange={(open) => {
          if (!open) setConnectionToDisconnect(null)
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
            <AlertDialog.Title className="text-lg font-semibold text-gray-900">
              Disconnect{' '}
              {connectionToDisconnect?.provider === 'google'
                ? 'Google'
                : 'Facebook'}
              ?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-gray-600">
              This user will no longer be able to log in with{' '}
              {connectionToDisconnect?.provider === 'google'
                ? 'Google'
                : 'Facebook'}
              . They can reconnect later if needed.
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end space-x-3">
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={disconnectMutation.isPending}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  )
}
