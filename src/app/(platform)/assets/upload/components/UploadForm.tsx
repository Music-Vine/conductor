'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@music-vine/cadence'
import { toast } from 'sonner'
import type { AssetType } from '@/types/asset'
import { useUploader } from '@/hooks/useUploader'
import { useDuplicateCheck } from '@/hooks/useDuplicateCheck'
import { validateFile } from '@/lib/upload'
import { FileDropzone, FileUploadList } from '@/components/upload'
import { SharedMetadataForm, type SharedMetadata } from './SharedMetadataForm'

export function UploadForm() {
  const router = useRouter()
  const [assetType, setAssetType] = useState<AssetType>('music')
  const [metadata, setMetadata] = useState<SharedMetadata | null>(null)
  const [validationErrors, setValidationErrors] = useState<Map<string, string[]>>(new Map())

  const { checkDuplicate, checking: checkingDuplicates } = useDuplicateCheck()

  const uploader = useUploader({
    assetType,
    onFileComplete: (file) => {
      console.log('File complete:', file)
    },
    onAllComplete: async (files) => {
      // Create asset records for completed files
      if (!metadata) return

      try {
        for (const file of files) {
          // Merge shared metadata (contributor, genre, tags) with per-file extracted metadata (duration, BPM, resolution)
          const perFileMetadata = uploader.getFileMetadata(file.originalName) // { duration?, bpm?, key?, resolution? }
          await fetch('/api/assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              type: assetType,
              // Use originalName (preserved from File object) for asset title, not name (which may be sanitized)
              title: file.originalName.replace(/\.[^/.]+$/, ''), // Remove extension from original filename
              fileKey: file.fileKey,
              ...metadata,        // Shared: contributor, genre, tags
              ...perFileMetadata, // Per-file: duration, BPM, key, resolution (extracted from each file)
            }),
          })
        }
        toast.success(`${files.length} asset(s) uploaded successfully`)
        router.push('/assets')
      } catch (error) {
        toast.error('Failed to create asset records')
      }
    },
    onError: (file, error) => {
      toast.error(`Upload failed: ${file.name}`)
    },
  })

  const handleFilesSelected = useCallback(async (files: File[]) => {
    const newErrors = new Map<string, string[]>()

    for (const file of files) {
      // Validate file
      const validation = await validateFile(file, assetType)
      if (!validation.valid) {
        newErrors.set(file.name, validation.errors)
        continue
      }

      // Check for duplicates
      const duplicate = await checkDuplicate(file)
      if (duplicate.isDuplicate) {
        newErrors.set(file.name, [`Duplicate of existing asset: ${duplicate.existingAssetTitle}`])
        continue
      }

      // File is valid, add to uploader
      uploader.addFiles([file])

      // Store per-file extracted metadata (duration, BPM, resolution) using filename as key
      // NOT in shared metadata - these are file-specific per CONTEXT decision
      if (validation.metadata) {
        // Per-file metadata stored with filename as key (will be retrieved via file.originalName later)
        uploader.setFileMetadata(file.name, validation.metadata)
      }
    }

    setValidationErrors(newErrors)
  }, [assetType, checkDuplicate, uploader])

  const canStartUpload = uploader.files.length > 0 && metadata?.contributorId && !uploader.isUploading
  const hasValidationErrors = validationErrors.size > 0

  return (
    <div className="max-w-3xl space-y-8">
      {/* Step 1: Select asset type */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">1. Select Asset Type</h2>
        <div className="flex flex-wrap gap-2">
          {(['music', 'sfx', 'motion-graphics', 'lut', 'stock-footage'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setAssetType(type)
                uploader.clearFiles()
                setValidationErrors(new Map())
              }}
              disabled={uploader.isUploading}
              className={`
                px-4 py-2 rounded-lg border text-sm font-medium transition-colors
                ${assetType === type
                  ? 'border-platform-primary bg-platform-primary text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }
                ${uploader.isUploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {type === 'motion-graphics' ? 'Motion Graphics' :
               type === 'stock-footage' ? 'Stock Footage' :
               type === 'lut' ? 'LUTs' :
               type === 'sfx' ? 'SFX' :
               'Music'}
            </button>
          ))}
        </div>
      </section>

      {/* Step 2: Select files */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">2. Select Files</h2>
        <FileDropzone
          assetType={assetType}
          onFilesSelected={handleFilesSelected}
          disabled={uploader.isUploading}
        />

        {/* Validation errors */}
        {hasValidationErrors && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 space-y-2">
            {Array.from(validationErrors.entries()).map(([filename, errors]) => (
              <div key={filename}>
                <p className="text-sm font-medium text-red-800">{filename}</p>
                <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                  {errors.map((error, i) => <li key={i}>{error}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* File list */}
        <FileUploadList
          files={uploader.files}
          onRemove={uploader.removeFile}
          onRetry={uploader.retryFile}
        />
      </section>

      {/* Step 3: Metadata */}
      {uploader.files.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">3. Add Metadata</h2>
          <p className="text-sm text-gray-600">
            This metadata will be applied to all uploaded files.
          </p>
          <SharedMetadataForm
            assetType={assetType}
            onChange={setMetadata}
            disabled={uploader.isUploading}
          />
        </section>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button
          variant="subtle"
          onClick={() => router.push('/assets')}
          disabled={uploader.isUploading}
        >
          Cancel
        </Button>
        <Button
          variant="bold"
          onClick={() => uploader.startUpload()}
          disabled={!canStartUpload}
        >
          {uploader.isUploading
            ? `Uploading... (${uploader.files.filter(f => f.status === 'complete').length}/${uploader.files.length})`
            : `Upload ${uploader.files.length} File${uploader.files.length === 1 ? '' : 's'}`}
        </Button>
      </div>
    </div>
  )
}
