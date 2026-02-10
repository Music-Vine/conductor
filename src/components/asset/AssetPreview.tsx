'use client'

import type { Asset } from '@/types/asset'
import { AudioWaveformPlayer } from './AudioWaveformPlayer'
import { VideoPlayer } from './VideoPlayer'

interface AssetPreviewProps {
  asset: Asset
  className?: string
}

export function AssetPreview({ asset, className }: AssetPreviewProps) {
  const isAudio = asset.type === 'music' || asset.type === 'sfx'
  const isVideo = asset.type === 'motion-graphics' || asset.type === 'stock-footage'
  const isLut = asset.type === 'lut'

  if (!asset.fileUrl) {
    return <PreviewNotAvailable message="File not available for preview" />
  }

  if (isAudio) {
    return <AudioWaveformPlayer audioUrl={asset.fileUrl} className={className} />
  }

  if (isVideo) {
    return <VideoPlayer videoUrl={asset.fileUrl} className={className} />
  }

  if (isLut) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <div className="text-4xl mb-4">🎨</div>
        <p className="text-gray-600">LUT preview not available</p>
        <p className="text-sm text-gray-500 mt-2">
          Download the file to preview in your editing software
        </p>
      </div>
    )
  }

  return <PreviewNotAvailable message="Preview not available for this file type" />
}

function PreviewNotAvailable({ message }: { message: string }) {
  return (
    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl text-gray-400 mb-2">📁</div>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  )
}
