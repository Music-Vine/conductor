import type { AssetType } from '@/types/asset'
import { extractMediaMetadata, formatResolution } from './media-metadata'
import { detectBPMSafe } from './bpm-detector'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  metadata?: {
    duration?: number
    resolution?: string
    bpm?: number
  }
}

const allowedTypes: Record<AssetType, string[]> = {
  music: ['.mp3', '.wav', '.flac', '.aiff'],
  sfx: ['.mp3', '.wav'],
  'motion-graphics': ['.mp4', '.mov'],
  lut: ['.cube', '.3dl'],
  'stock-footage': ['.mp4', '.mov'],
}

const maxFileSize = 5 * 1024 * 1024 * 1024 // 5GB per CONTEXT

/**
 * Validate file for upload, checking type, size, and extracting metadata.
 */
export async function validateFile(
  file: File,
  assetType: AssetType
): Promise<ValidationResult> {
  const errors: string[] = []
  const metadata: ValidationResult['metadata'] = {}

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!allowedTypes[assetType]?.includes(extension)) {
    errors.push(
      `Invalid file type for ${assetType}. Allowed: ${allowedTypes[assetType].join(', ')}`
    )
  }

  // Check file size
  if (file.size > maxFileSize) {
    errors.push(`File too large. Maximum size: 5GB`)
  }

  // Extract metadata if file type is valid
  if (errors.length === 0) {
    try {
      if (assetType === 'music' || assetType === 'sfx') {
        const mediaData = await extractMediaMetadata(file)
        metadata.duration = mediaData.duration

        // BPM detection for music only (optional, don't fail on error)
        if (assetType === 'music') {
          metadata.bpm = (await detectBPMSafe(file)) ?? undefined
        }
      } else if (['motion-graphics', 'stock-footage'].includes(assetType)) {
        const mediaData = await extractMediaMetadata(file)
        metadata.duration = mediaData.duration
        if (mediaData.width && mediaData.height) {
          metadata.resolution = formatResolution(
            mediaData.width,
            mediaData.height
          )
        }
      }
      // LUTs don't need metadata extraction
    } catch (e) {
      errors.push(`Failed to read file metadata: ${(e as Error).message}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    metadata: errors.length === 0 ? metadata : undefined,
  }
}

/**
 * Get allowed file types for an asset type.
 */
export function getAllowedTypes(assetType: AssetType): string[] {
  return allowedTypes[assetType] || []
}

/**
 * Format file size for display.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
