'use client'

import Uppy from '@uppy/core'
import AwsS3 from '@uppy/aws-s3'
import { useState, useEffect, useCallback, useMemo } from 'react'
import type { AssetType } from '@/types/asset'
import { getAllowedTypes } from '@/lib/upload'

export interface UploadFile {
  id: string
  name: string           // Display name (may be sanitized by Uppy)
  originalName: string   // Original filename from File object - use this for asset titles
  size: number
  type: string
  progress: number
  status: 'pending' | 'validating' | 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
  fileKey?: string
}

interface UseUploaderOptions {
  assetType: AssetType
  onFileComplete?: (file: UploadFile) => void
  onAllComplete?: (files: UploadFile[]) => void
  onError?: (file: UploadFile, error: Error) => void
}

export function useUploader(options: UseUploaderOptions) {
  const { assetType, onFileComplete, onAllComplete, onError } = options
  const [files, setFiles] = useState<UploadFile[]>([])

  // File metadata storage for passing data between validation and asset creation
  const [fileMetadata] = useState(new Map<string, any>())

  const setFileMetadata = (fileId: string, metadata: any) => {
    fileMetadata.set(fileId, metadata)
  }

  const getFileMetadata = (fileId: string) => {
    return fileMetadata.get(fileId)
  }

  // Get allowed file extensions for this asset type
  const allowedTypes = useMemo(() => getAllowedTypes(assetType), [assetType])

  // Create Uppy instance
  const [uppy] = useState(() => {
    const instance = new Uppy({
      restrictions: {
        maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
        allowedFileTypes: allowedTypes,
      },
      autoProceed: false, // Manual upload trigger
    })

    // Configure S3 plugin with mock endpoints for both multipart and single-part
    instance.use(AwsS3, {
      shouldUseMultipart: (file) => (file.size ?? 0) > 100 * 1024 * 1024, // >100MB

      // Single-part upload
      async getUploadParameters(file) {
        const response = await fetch('/api/assets/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            size: file.size,
          }),
        })
        if (!response.ok) throw new Error('Failed to get upload URL')
        const { url, key } = await response.json()
        // Store key in file meta for later retrieval
        file.meta.key = key
        return { method: 'PUT', url, headers: {} }
      },

      // Multipart upload: create session
      async createMultipartUpload(file) {
        const response = await fetch('/api/assets/multipart/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        })
        if (!response.ok) throw new Error('Failed to create multipart upload')
        return response.json()
      },

      // Multipart upload: sign individual parts
      async signPart(file, { key, uploadId, partNumber }) {
        const response = await fetch('/api/assets/multipart/sign-part', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, uploadId, partNumber }),
        })
        if (!response.ok) throw new Error('Failed to sign part')
        return response.json()
      },

      // Multipart upload: finalize
      async completeMultipartUpload(file, { key, uploadId, parts }) {
        const response = await fetch('/api/assets/multipart/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, uploadId, parts }),
        })
        if (!response.ok) throw new Error('Failed to complete multipart upload')
        return {}
      },

      // Multipart upload: cancel
      async abortMultipartUpload(file, { key, uploadId }) {
        await fetch('/api/assets/multipart/abort', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, uploadId }),
        })
      },

      // List existing parts for resume
      async listParts(file, { key, uploadId }) {
        // Mock implementation - return empty array (no resume support for mock)
        return []
      },
    })

    return instance
  })

  // Setup event handlers
  useEffect(() => {
    const handleFileAdded = (file: any) => {
      setFiles(prev => [...prev, {
        id: file.id,
        name: file.name,
        originalName: file.data?.name || file.name, // Preserve original File.name for asset titles
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'pending',
      }])
    }

    const handleProgress = (file: any, progress: any) => {
      const percent = Math.round((progress.bytesUploaded / progress.bytesTotal) * 95) // Reserve 5% for finalization
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, progress: percent, status: 'uploading' } : f
      ))
    }

    const handleUploadSuccess = (file: any, response: any) => {
      const fileKey = file.meta?.key || response?.key
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, progress: 100, status: 'complete', fileKey } : f
      ))
      const uploadFile = files.find(f => f.id === file.id)
      if (uploadFile) onFileComplete?.({ ...uploadFile, status: 'complete', progress: 100, fileKey })
    }

    const handleUploadError = (file: any, error: any) => {
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'error', error: error?.message || 'Upload failed' } : f
      ))
      const uploadFile = files.find(f => f.id === file.id)
      if (uploadFile) onError?.({ ...uploadFile, status: 'error' }, error)
    }

    const handleComplete = (result: any) => {
      if (result.successful.length > 0) {
        onAllComplete?.(files.filter(f => f.status === 'complete'))
      }
    }

    uppy.on('file-added', handleFileAdded)
    uppy.on('upload-progress', handleProgress)
    uppy.on('upload-success', handleUploadSuccess)
    uppy.on('upload-error', handleUploadError)
    uppy.on('complete', handleComplete)

    return () => {
      uppy.off('file-added', handleFileAdded)
      uppy.off('upload-progress', handleProgress)
      uppy.off('upload-success', handleUploadSuccess)
      uppy.off('upload-error', handleUploadError)
      uppy.off('complete', handleComplete)
    }
  }, [uppy, files, onFileComplete, onAllComplete, onError])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      uppy.cancelAll()
    }
  }, [uppy])

  const addFiles = useCallback((newFiles: File[]) => {
    newFiles.forEach(file => {
      try {
        uppy.addFile({
          name: file.name,
          type: file.type,
          data: file,
        })
      } catch (e) {
        // Uppy throws if file doesn't meet restrictions
        console.error('Failed to add file:', e)
      }
    })
  }, [uppy])

  const removeFile = useCallback((fileId: string) => {
    uppy.removeFile(fileId)
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }, [uppy])

  const startUpload = useCallback(() => {
    // Mark all pending files as uploading
    setFiles(prev => prev.map(f =>
      f.status === 'pending' ? { ...f, status: 'uploading' } : f
    ))
    uppy.upload()
  }, [uppy])

  const retryFile = useCallback((fileId: string) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, status: 'pending', error: undefined, progress: 0 } : f
    ))
    uppy.retryUpload(fileId)
  }, [uppy])

  const clearFiles = useCallback(() => {
    uppy.cancelAll()
    setFiles([])
  }, [uppy])

  return {
    files,
    addFiles,
    removeFile,
    startUpload,
    retryFile,
    clearFiles,
    setFileMetadata,  // Store metadata extracted during validation
    getFileMetadata,  // Retrieve metadata for asset creation
    isUploading: files.some(f => f.status === 'uploading'),
    hasErrors: files.some(f => f.status === 'error'),
    allComplete: files.length > 0 && files.every(f => f.status === 'complete'),
  }
}
