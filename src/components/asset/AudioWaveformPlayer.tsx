'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useWavesurfer } from '@wavesurfer/react'

interface AudioWaveformPlayerProps {
  audioUrl: string
  className?: string
}

export function AudioWaveformPlayer({ audioUrl, className }: AudioWaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const { wavesurfer, isReady, currentTime } = useWavesurfer({
    container: containerRef,
    url: audioUrl,
    waveColor: '#e5e7eb', // gray-200
    progressColor: 'var(--platform-primary, #3b82f6)', // Use CSS variable for platform color
    cursorColor: '#1f2937', // gray-800
    height: 80,
    normalize: true,
    barWidth: 2,
    barGap: 1,
    barRadius: 2,
  })

  // Update playing state when wavesurfer plays/pauses
  useEffect(() => {
    if (!wavesurfer) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleFinish = () => setIsPlaying(false)

    wavesurfer.on('play', handlePlay)
    wavesurfer.on('pause', handlePause)
    wavesurfer.on('finish', handleFinish)

    return () => {
      wavesurfer.un('play', handlePlay)
      wavesurfer.un('pause', handlePause)
      wavesurfer.un('finish', handleFinish)
    }
  }, [wavesurfer])

  const onPlayPause = useCallback(() => {
    if (wavesurfer) {
      wavesurfer.playPause()
    }
  }, [wavesurfer])

  const duration = wavesurfer?.getDuration() ?? 0

  return (
    <div className={className}>
      {/* Waveform container */}
      <div
        ref={containerRef}
        className="rounded-lg bg-gray-50 p-4 cursor-pointer"
        onClick={onPlayPause}
      />

      {/* Controls */}
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={onPlayPause}
          disabled={!isReady}
          className="rounded-full bg-platform-primary p-3 text-white hover:bg-platform-primary/90 disabled:opacity-50 transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <PauseIcon className="h-5 w-5" />
          ) : (
            <PlayIcon className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1">
          <div className="text-sm text-gray-600">
            <span className="font-mono">{formatTime(currentTime)}</span>
            <span className="mx-2">/</span>
            <span className="font-mono">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Loading indicator */}
        {!isReady && (
          <div className="text-sm text-gray-500">Loading waveform...</div>
        )}
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  )
}
