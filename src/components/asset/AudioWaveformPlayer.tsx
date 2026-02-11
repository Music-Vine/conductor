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
  const [error, setError] = useState<string | null>(null)

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
    const handleError = (err: Error) => {
      console.error('WaveSurfer error:', err)
      setError('Unable to load audio. The file may be unavailable or in an unsupported format.')
    }

    wavesurfer.on('play', handlePlay)
    wavesurfer.on('pause', handlePause)
    wavesurfer.on('finish', handleFinish)
    wavesurfer.on('error', handleError)

    return () => {
      wavesurfer.un('play', handlePlay)
      wavesurfer.un('pause', handlePause)
      wavesurfer.un('finish', handleFinish)
      wavesurfer.un('error', handleError)
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
      {error ? (
        <div className="rounded-lg bg-red-50 p-4 flex items-center gap-3">
          <ErrorIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Audio unavailable</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="rounded-lg bg-gray-50 p-4 cursor-pointer"
          onClick={onPlayPause}
        />
      )}

      {/* Controls */}
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={onPlayPause}
          disabled={!isReady || !!error}
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

        {/* Status indicator */}
        {!isReady && !error && (
          <div className="text-sm text-gray-500">Loading waveform...</div>
        )}
        {error && (
          <div className="text-sm text-red-600">{error}</div>
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

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  )
}
