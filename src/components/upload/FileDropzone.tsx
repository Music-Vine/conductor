'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import type { AssetType } from '@/types/asset'
import { getAllowedTypes } from '@/lib/upload'

interface FileDropzoneProps {
  assetType: AssetType
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
  className?: string
}

export function FileDropzone({ assetType, onFilesSelected, disabled, className }: FileDropzoneProps) {
  const allowedTypes = getAllowedTypes(assetType)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles)
  }, [onFilesSelected])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    disabled,
    accept: Object.fromEntries(
      allowedTypes.map(ext => {
        const mimeMap: Record<string, string> = {
          '.mp3': 'audio/mpeg',
          '.wav': 'audio/wav',
          '.flac': 'audio/flac',
          '.aiff': 'audio/aiff',
          '.mp4': 'video/mp4',
          '.mov': 'video/quicktime',
          '.cube': 'application/octet-stream',
          '.3dl': 'application/octet-stream',
        }
        return [mimeMap[ext] || 'application/octet-stream', [ext]]
      })
    ),
    maxSize: 5 * 1024 * 1024 * 1024, // 5GB
  })

  const assetTypeLabels: Record<AssetType, string> = {
    music: 'music files',
    sfx: 'sound effects',
    'motion-graphics': 'motion graphics',
    lut: 'LUT files',
    'stock-footage': 'stock footage',
  }

  return (
    <div
      {...getRootProps()}
      className={`
        relative rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer
        ${isDragActive && !isDragReject ? 'border-platform-primary bg-platform-primary/5' : ''}
        ${isDragReject ? 'border-red-500 bg-red-50' : ''}
        ${!isDragActive && !disabled ? 'border-gray-300 hover:border-gray-400' : ''}
        ${disabled ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : ''}
        ${className || ''}
      `}
    >
      <input {...getInputProps()} />

      <div className="space-y-2">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
          </svg>
        </div>

        {isDragReject ? (
          <p className="text-red-600 font-medium">Invalid file type</p>
        ) : isDragActive ? (
          <p className="text-platform-primary font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-gray-700">
              <span className="font-medium text-platform-primary">Click to upload</span>
              {' '}or drag and drop
            </p>
            <p className="text-sm text-gray-500">
              {assetTypeLabels[assetType]} ({allowedTypes.join(', ')}) up to 5GB
            </p>
          </>
        )}
      </div>
    </div>
  )
}
