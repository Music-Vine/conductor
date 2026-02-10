export interface MediaMetadata {
  duration: number // seconds
  width?: number // video only
  height?: number // video only
}

/**
 * Extract media metadata using HTML5 media elements.
 * Works for audio (mp3, wav, flac) and video (mp4, mov) files.
 */
export function extractMediaMetadata(file: File): Promise<MediaMetadata> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const isVideo = file.type.startsWith('video/')
    const element = isVideo
      ? document.createElement('video')
      : document.createElement('audio')

    element.preload = 'metadata'

    element.onloadedmetadata = () => {
      const metadata: MediaMetadata = {
        duration: element.duration,
      }

      if (isVideo && element instanceof HTMLVideoElement) {
        metadata.width = element.videoWidth
        metadata.height = element.videoHeight
      }

      URL.revokeObjectURL(url)
      resolve(metadata)
    }

    element.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Failed to load metadata for ${file.name}`))
    }

    element.src = url
  })
}

/**
 * Format resolution string from width/height.
 */
export function formatResolution(width: number, height: number): string {
  return `${width}x${height}`
}
