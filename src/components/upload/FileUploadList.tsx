'use client'

import { Button } from '@music-vine/cadence'
import type { UploadFile } from '@/hooks/useUploader'
import { formatFileSize } from '@/lib/upload'

interface FileUploadListProps {
  files: UploadFile[]
  onRemove: (fileId: string) => void
  onRetry: (fileId: string) => void
}

export function FileUploadList({ files, onRemove, onRetry }: FileUploadListProps) {
  if (files.length === 0) return null

  return (
    <div className="space-y-2">
      {files.map(file => (
        <FileUploadItem
          key={file.id}
          file={file}
          onRemove={() => onRemove(file.id)}
          onRetry={() => onRetry(file.id)}
        />
      ))}
    </div>
  )
}

interface FileUploadItemProps {
  file: UploadFile
  onRemove: () => void
  onRetry: () => void
}

function FileUploadItem({ file, onRemove, onRetry }: FileUploadItemProps) {
  const statusColors: Record<UploadFile['status'], string> = {
    pending: 'text-gray-500',
    validating: 'text-blue-500',
    uploading: 'text-blue-600',
    processing: 'text-yellow-600',
    complete: 'text-green-600',
    error: 'text-red-600',
  }

  const statusLabels: Record<UploadFile['status'], string> = {
    pending: 'Pending',
    validating: 'Validating...',
    uploading: 'Uploading...',
    processing: 'Processing...',
    complete: 'Complete',
    error: 'Failed',
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
      {/* File icon */}
      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
        <FileIcon type={file.type} />
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>

        {/* Progress bar for uploading status */}
        {file.status === 'uploading' && (
          <div className="mt-2">
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-platform-primary transition-all duration-300"
                style={{ width: `${file.progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">{file.progress}%</p>
          </div>
        )}

        {/* Error message */}
        {file.status === 'error' && file.error && (
          <p className="mt-1 text-xs text-red-600">{file.error}</p>
        )}
      </div>

      {/* Status */}
      <div className="flex-shrink-0 text-right">
        <span className={`text-sm font-medium ${statusColors[file.status]}`}>
          {statusLabels[file.status]}
        </span>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {file.status === 'error' && (
          <Button variant="subtle" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
        {(file.status === 'pending' || file.status === 'error') && (
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Remove file"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {file.status === 'complete' && (
          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
  )
}

function FileIcon({ type }: { type: string }) {
  const isAudio = type.startsWith('audio/')
  const isVideo = type.startsWith('video/')

  if (isAudio) {
    return (
      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    )
  }

  if (isVideo) {
    return (
      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    )
  }

  return (
    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )
}
