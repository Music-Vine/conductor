# Phase 4: Catalog Management - Research

**Researched:** 2026-02-09
**Domain:** Asset upload, metadata management, multi-stage approval workflows, S3 integration, audio/video file handling
**Confidence:** HIGH

## Summary

Phase 4 implements a complete catalog management system for Music Vine and Uppbeat assets. The core challenge is building a reliable file upload pipeline (multi-file, resumable, with client-side validation) that integrates with S3 via presigned URLs, combined with a workflow state machine for managing multi-stage music approvals and single-stage approvals for other asset types (SFX, motion graphics, LUTs, stock footage).

The standard approach combines Uppy for resumable file uploads with per-file progress tracking, the Web Crypto API for SHA-256 file hashing (duplicate detection), and browser-native HTML5 video/audio elements for extracting duration metadata. For audio BPM detection, web-audio-beat-detector provides client-side analysis. Workflow state transitions can be implemented with simple TypeScript discriminated unions rather than a full state machine library, given the fixed linear nature of the approval stages.

The CONTEXT decisions are comprehensive and locked: multi-file uploads with shared metadata, chunked resumable uploads, per-file progress tracking, client-side file hashing, type-specific metadata fields, fixed linear workflow stages for music, and simplified single-stage workflows for other asset types. The main technical challenges are: (1) orchestrating multipart S3 uploads with presigned URLs per chunk, (2) extracting audio/video metadata in the browser before upload, and (3) building a timeline UI for workflow history.

**Primary recommendation:** Use Uppy 4.x with @uppy/aws-s3 for multipart uploads, react-dropzone for the drag-drop zone, Web Crypto API for SHA-256 hashing, HTML5 loadedmetadata events for duration extraction, web-audio-beat-detector for BPM analysis, and WaveSurfer.js for audio waveform preview. Implement workflow state as a TypeScript discriminated union with transition functions rather than a full XState machine.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @uppy/core | 4.x | File upload orchestration | Modular architecture, pause/resume, progress tracking, batch uploads, 9M+ weekly downloads |
| @uppy/aws-s3 | 4.x | S3 presigned URL uploads | Native multipart support, configurable threshold, handles chunked uploads |
| @uppy/dashboard | 4.x | Pre-built upload UI | Drag-drop, progress bars, file list, retries, all accessibility handled |
| react-dropzone | 14.x | Drag-drop file zone | React hooks API, lightweight (no UI opinions), 3M+ weekly downloads |
| wavesurfer.js | 7.x | Audio waveform visualization | Industry standard, Web Audio API based, plugins for regions/controls |
| web-audio-beat-detector | 9.x | BPM detection | Client-side beat analysis, returns BPM + beat offset, Web Audio API |
| music-metadata | 8.x | Audio metadata extraction | ID3/Vorbis tags, duration, bitrate, works in browser with bundler |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @uppy/tus | 4.x | Tus protocol support | Alternative to S3 multipart if backend uses tus server |
| react-tag-autocomplete | 7.x | Tag input with suggestions | Genre/mood tag entry with autocomplete |
| @wavesurfer/react | 1.x | React wrapper for WaveSurfer | Simpler integration vs manual ref management |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Uppy | Native fetch + manual chunking | Uppy handles edge cases (retry, pause, progress), manual approach is 10x more code |
| react-dropzone + Uppy | Uppy Dashboard alone | Dashboard is heavier but provides complete UI; react-dropzone is lighter for custom UI |
| WaveSurfer.js | peaks.js (BBC) | peaks.js is for server-generated peaks; WaveSurfer decodes client-side which matches our flow |
| web-audio-beat-detector | music-tempo | Both use Beatroot algorithm, web-audio-beat-detector has simpler API |

**Installation:**
```bash
npm install @uppy/core @uppy/aws-s3 @uppy/dashboard react-dropzone wavesurfer.js @wavesurfer/react web-audio-beat-detector music-metadata react-tag-autocomplete
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(platform)/assets/
│   ├── page.tsx                 # Asset list with filters
│   ├── upload/
│   │   └── page.tsx             # Upload interface
│   └── [id]/
│       ├── page.tsx             # Asset detail (tabs)
│       └── components/
│           ├── OverviewTab.tsx
│           ├── WorkflowTab.tsx
│           ├── CollectionsTab.tsx
│           └── ActivityTab.tsx
├── app/(platform)/collections/
│   ├── page.tsx                 # Collections list
│   └── [id]/
│       └── page.tsx             # Collection detail
├── components/
│   ├── upload/
│   │   ├── FileDropzone.tsx     # Drag-drop zone
│   │   ├── FileUploadList.tsx   # Per-file progress
│   │   ├── SharedMetadataForm.tsx
│   │   └── hooks/
│   │       ├── useUploader.tsx  # Uppy integration
│   │       ├── useFileValidation.tsx
│   │       └── useDuplicateCheck.tsx
│   ├── asset/
│   │   ├── AssetTable.tsx       # Virtualized table (reuse patterns)
│   │   ├── AssetPreview.tsx     # Audio/video player
│   │   ├── AssetMetadataForm.tsx
│   │   └── WorkflowTimeline.tsx
│   └── workflow/
│       ├── ApprovalForm.tsx     # Checklist + comments
│       └── WorkflowActions.tsx  # Approve/Reject/Request Changes
├── lib/
│   ├── upload/
│   │   ├── presigned-urls.ts    # API calls for presigned URLs
│   │   ├── file-hash.ts         # SHA-256 hashing with Web Crypto
│   │   ├── media-metadata.ts    # Extract duration, resolution
│   │   └── bpm-detector.ts      # Web Audio BPM detection
│   └── workflow/
│       ├── states.ts            # Workflow state types
│       └── transitions.ts       # State transition logic
└── types/
    ├── asset.ts                 # Asset types per CONTEXT
    ├── workflow.ts              # WorkflowAction, WorkflowState
    └── collection.ts            # Collection types
```

### Pattern 1: S3 Multipart Upload with Presigned URLs
**What:** Upload large files in chunks, each chunk gets its own presigned URL, enabling resume after failure.
**When to use:** All file uploads (essential for video files, beneficial for all sizes).
**Example:**
```typescript
// Source: https://uppy.io/docs/aws-s3/
import Uppy from '@uppy/core'
import AwsS3 from '@uppy/aws-s3'

const uppy = new Uppy({
  restrictions: {
    maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
    allowedFileTypes: ['.mp3', '.wav', '.mp4', '.mov', '.cube'],
  },
})

uppy.use(AwsS3, {
  // Use multipart for files > 100MB (Uppy default)
  shouldUseMultipart: (file) => file.size > 100 * 1024 * 1024,

  // Get presigned URL for single-part upload
  async getUploadParameters(file) {
    const response = await fetch('/api/assets/presigned-url', {
      method: 'POST',
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
      }),
    })
    const { url, fields } = await response.json()
    return { method: 'PUT', url, headers: {} }
  },

  // Multipart upload handlers
  async createMultipartUpload(file) {
    const response = await fetch('/api/assets/multipart/create', {
      method: 'POST',
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    })
    const { uploadId, key } = await response.json()
    return { uploadId, key }
  },

  async signPart(file, partData) {
    const response = await fetch('/api/assets/multipart/sign-part', {
      method: 'POST',
      body: JSON.stringify({
        key: partData.key,
        uploadId: partData.uploadId,
        partNumber: partData.partNumber,
      }),
    })
    const { url } = await response.json()
    return { url }
  },

  async completeMultipartUpload(file, { uploadId, key, parts }) {
    await fetch('/api/assets/multipart/complete', {
      method: 'POST',
      body: JSON.stringify({ key, uploadId, parts }),
    })
    return {}
  },

  async abortMultipartUpload(file, { uploadId, key }) {
    await fetch('/api/assets/multipart/abort', {
      method: 'POST',
      body: JSON.stringify({ key, uploadId }),
    })
  },
})

// Track progress per file
uppy.on('upload-progress', (file, progress) => {
  console.log(`${file.name}: ${progress.bytesUploaded}/${progress.bytesTotal}`)
})
```

### Pattern 2: Client-Side File Hashing for Duplicate Detection
**What:** Hash file contents with SHA-256 using Web Crypto API before upload to detect duplicates.
**When to use:** Always before upload to prevent duplicate asset uploads.
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
async function hashFile(file: File): Promise<string> {
  // Read file as ArrayBuffer
  const buffer = await file.arrayBuffer()

  // Hash with SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return hashHex
}

// Check for duplicates before upload
async function checkDuplicate(file: File): Promise<{ isDuplicate: boolean; existingAssetId?: string }> {
  const hash = await hashFile(file)

  const response = await fetch('/api/assets/check-duplicates', {
    method: 'POST',
    body: JSON.stringify({ hash, filename: file.name }),
  })

  return response.json()
}

// Usage with Uppy
uppy.on('file-added', async (file) => {
  const { isDuplicate, existingAssetId } = await checkDuplicate(file.data as File)
  if (isDuplicate) {
    uppy.removeFile(file.id)
    uppy.info(`Duplicate detected: ${file.name} already exists`, 'warning', 5000)
  }
})
```

### Pattern 3: Extract Audio/Video Metadata in Browser
**What:** Use HTML5 media elements to extract duration, and Web Audio API for BPM.
**When to use:** Client-side validation and metadata pre-filling before upload.
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/loadedmetadata_event
interface MediaMetadata {
  duration: number // seconds
  width?: number   // video only
  height?: number  // video only
}

function extractMediaMetadata(file: File): Promise<MediaMetadata> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const isVideo = file.type.startsWith('video/')
    const element = isVideo ? document.createElement('video') : document.createElement('audio')

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

// BPM detection for music files
// Source: https://github.com/chrisguttandin/web-audio-beat-detector
import { analyze, guess } from 'web-audio-beat-detector'

async function detectBPM(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer()
  const audioContext = new AudioContext()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

  try {
    const { bpm } = await guess(audioBuffer)
    return Math.round(bpm)
  } finally {
    await audioContext.close()
  }
}
```

### Pattern 4: Workflow State Machine (Simple Approach)
**What:** Typed state transitions without a full state machine library.
**When to use:** Fixed linear workflows with clear state transitions.
**Example:**
```typescript
// Source: TypeScript discriminated unions pattern
// Per CONTEXT: Fixed linear stages for music workflow

type MusicWorkflowState =
  | 'draft'
  | 'submitted'
  | 'initial_review'
  | 'quality_check'
  | 'platform_assignment'
  | 'final_approval'
  | 'published'
  | 'rejected_initial'
  | 'rejected_quality'
  | 'rejected_final'

type SimpleWorkflowState =
  | 'draft'
  | 'submitted'
  | 'review'
  | 'published'
  | 'rejected'

type WorkflowAction = 'approve' | 'reject' | 'request_changes' | 'submit' | 'unpublish'

interface StateTransition<S> {
  from: S
  action: WorkflowAction
  to: S
}

const musicTransitions: StateTransition<MusicWorkflowState>[] = [
  { from: 'draft', action: 'submit', to: 'submitted' },
  { from: 'submitted', action: 'approve', to: 'initial_review' },
  { from: 'initial_review', action: 'approve', to: 'quality_check' },
  { from: 'initial_review', action: 'reject', to: 'rejected_initial' },
  { from: 'quality_check', action: 'approve', to: 'platform_assignment' },
  { from: 'quality_check', action: 'reject', to: 'rejected_quality' },
  { from: 'platform_assignment', action: 'approve', to: 'final_approval' },
  { from: 'final_approval', action: 'approve', to: 'published' },
  { from: 'final_approval', action: 'reject', to: 'rejected_final' },
  { from: 'published', action: 'unpublish', to: 'draft' },
  // Re-submission from rejected states
  { from: 'rejected_initial', action: 'submit', to: 'submitted' },
  { from: 'rejected_quality', action: 'submit', to: 'submitted' },
  { from: 'rejected_final', action: 'submit', to: 'submitted' },
]

function getNextState<S>(
  currentState: S,
  action: WorkflowAction,
  transitions: StateTransition<S>[]
): S | null {
  const transition = transitions.find(t => t.from === currentState && t.action === action)
  return transition?.to ?? null
}

function getAvailableActions<S>(
  currentState: S,
  transitions: StateTransition<S>[]
): WorkflowAction[] {
  return transitions
    .filter(t => t.from === currentState)
    .map(t => t.action)
}
```

### Pattern 5: Workflow Timeline Component
**What:** Vertical timeline showing approval history with status indicators.
**When to use:** Asset detail page to show full approval history.
**Example:**
```typescript
// Source: Tailwind + custom component (no external library needed)
interface TimelineItem {
  id: string
  stage: string
  status: 'completed' | 'current' | 'pending'
  reviewer?: { name: string; avatar?: string }
  timestamp?: Date
  feedback?: string
  checklist?: { item: string; checked: boolean }[]
}

function WorkflowTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative border-l border-gray-200">
      {items.map((item, index) => (
        <li key={item.id} className="mb-10 ml-6">
          {/* Status indicator */}
          <span className={`
            absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full
            ${item.status === 'completed' ? 'bg-green-500' : ''}
            ${item.status === 'current' ? 'bg-blue-500 ring-4 ring-blue-100' : ''}
            ${item.status === 'pending' ? 'bg-gray-300' : ''}
          `}>
            {item.status === 'completed' && <CheckIcon className="h-4 w-4 text-white" />}
            {item.status === 'current' && <span className="h-2 w-2 rounded-full bg-white" />}
          </span>

          {/* Content */}
          <div className="ml-2">
            <h3 className="font-medium text-gray-900">{item.stage}</h3>

            {item.reviewer && (
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <span>{item.reviewer.name}</span>
                {item.timestamp && (
                  <span>{formatDistanceToNow(item.timestamp)}</span>
                )}
              </div>
            )}

            {item.feedback && (
              <p className="mt-2 text-sm text-gray-600">{item.feedback}</p>
            )}

            {item.checklist && (
              <ul className="mt-2 space-y-1">
                {item.checklist.map((check, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    {check.checked ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span>{check.item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
```

### Pattern 6: Audio Waveform Preview
**What:** WaveSurfer.js integration for audio file preview with playback controls.
**When to use:** Asset preview in detail page for music and SFX.
**Example:**
```typescript
// Source: https://wavesurfer.xyz/ + @wavesurfer/react
import { useWavesurfer } from '@wavesurfer/react'
import { useRef, useState, useCallback } from 'react'

function AudioWaveformPlayer({ audioUrl }: { audioUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const { wavesurfer, isReady, currentTime } = useWavesurfer({
    container: containerRef,
    url: audioUrl,
    waveColor: '#e5e7eb', // gray-200
    progressColor: '#3b82f6', // blue-500 (platform-primary)
    cursorColor: '#1f2937', // gray-800
    height: 80,
    normalize: true,
    barWidth: 2,
    barGap: 1,
    barRadius: 2,
  })

  const onPlayPause = useCallback(() => {
    if (wavesurfer) {
      wavesurfer.playPause()
      setIsPlaying(!isPlaying)
    }
  }, [wavesurfer, isPlaying])

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="rounded-lg bg-gray-50 p-4" />

      <div className="flex items-center gap-4">
        <button
          onClick={onPlayPause}
          disabled={!isReady}
          className="rounded-full bg-platform-primary p-3 text-white hover:bg-platform-primary/90 disabled:opacity-50"
        >
          {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
        </button>

        <span className="text-sm text-gray-600">
          {formatTime(currentTime)} / {formatTime(wavesurfer?.getDuration() ?? 0)}
        </span>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
```

### Anti-Patterns to Avoid

- **Uploading via API proxy:** Don't stream files through your Next.js API routes. Use presigned URLs for direct browser-to-S3 uploads. Proxying doubles bandwidth and adds latency.

- **Synchronous file hashing for large files:** Don't block the main thread while hashing gigabyte video files. Use web workers or show a clear progress indicator during hashing.

- **Full XState for simple linear workflows:** Don't over-engineer with XState when the workflow is fixed and linear. Simple TypeScript types with transition functions are sufficient and more maintainable.

- **Client-side audio processing without cleanup:** Always close AudioContext after BPM detection. Leaving contexts open causes memory leaks and "too many AudioContexts" errors.

- **Hardcoding file validation rules:** Don't scatter file type/size checks across components. Centralize in Uppy restrictions config for consistency.

- **Ignoring upload state on page navigation:** Use Uppy's state persistence to resume uploads if user accidentally navigates away, or warn before navigation.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Resumable uploads | XMLHttpRequest with manual chunking | Uppy + @uppy/aws-s3 | Handles multipart orchestration, retry logic, progress calculation, S3 completion/abort lifecycle |
| File drag-drop zone | ondragenter/ondragover/ondrop | react-dropzone | Handles browser quirks, nested drop zones, directory drops, disabled states, accessibility |
| SHA-256 file hashing | Third-party crypto library | Web Crypto API (native) | Built into browsers, hardware-accelerated, no bundle size impact, secure context required |
| Audio BPM detection | Manual peak detection | web-audio-beat-detector | Beatroot algorithm implementation, handles various genres, returns confidence scores |
| Waveform visualization | Manual Canvas drawing | WaveSurfer.js | Decoding, peaks caching, zoom, regions, mobile touch, responsive sizing all handled |
| Tag autocomplete input | Select with filter | react-tag-autocomplete | Accessibility (ARIA), keyboard navigation, paste handling, tag removal, style customization |

**Key insight:** File upload is deceptively complex. Edge cases include: browser closing mid-upload, S3 eventual consistency, multipart cleanup on failure, CORS headers for ETag access, progress calculation across chunks, duplicate chunk handling, and upload resumption after days. Uppy has solved all of these. Don't rebuild.

## Common Pitfalls

### Pitfall 1: CORS Not Exposing ETag Header
**What goes wrong:** Multipart uploads silently fail because browser can't read ETag header from S3 PUT response, which is required to complete multipart assembly.
**Why it happens:** S3 CORS config missing `ExposeHeaders: ["ETag"]` setting.
**How to avoid:** Configure S3 bucket CORS with `ExposeHeaders: ["ETag"]` for all PUT operations. Test in browser DevTools that ETag is visible in response headers.
**Warning signs:** Uploads complete per-chunk but `completeMultipartUpload` fails with "InvalidPart" error, ETag is undefined in Uppy callbacks.

### Pitfall 2: Memory Issues with Large File Hashing
**What goes wrong:** Browser tab crashes or becomes unresponsive when hashing gigabyte video files.
**Why it happens:** `file.arrayBuffer()` loads entire file into memory before hashing.
**How to avoid:** Use streaming approach with `FileReader` and incremental hashing, or move to web worker. Show progress indicator for files >100MB.
**Warning signs:** Tab freezes on large file selection, Chrome DevTools shows memory spike, mobile Safari crashes.

### Pitfall 3: AudioContext Limit Reached
**What goes wrong:** BPM detection fails with "NotSupportedError: The number of hardware contexts provided is at its limit."
**Why it happens:** Creating new AudioContext for each file without closing previous ones. Browsers limit to ~6 concurrent contexts.
**How to avoid:** Always call `audioContext.close()` after BPM detection. Queue BPM detection for multiple files rather than parallel processing.
**Warning signs:** First few files work, then BPM detection fails. Works after page refresh.

### Pitfall 4: Upload Progress Showing 100% Prematurely
**What goes wrong:** Progress bar jumps to 100% when last chunk finishes, but upload isn't complete (multipart assembly pending).
**Why it happens:** Not accounting for completeMultipartUpload step in progress calculation.
**How to avoid:** Reserve final 5-10% of progress bar for multipart completion step. Show "Finalizing..." text during assembly.
**Warning signs:** Users report uploads failing at 100%, refresh shows incomplete upload.

### Pitfall 5: Workflow Actions Available in Wrong States
**What goes wrong:** Staff can click "Approve" on already-approved assets, or "Reject" on published assets.
**Why it happens:** UI buttons don't check current workflow state before rendering.
**How to avoid:** Use `getAvailableActions()` function to determine which actions are valid. Disable or hide invalid action buttons.
**Warning signs:** Error messages about invalid state transitions, assets stuck in unexpected states.

### Pitfall 6: Presigned URLs Expiring Mid-Upload
**What goes wrong:** Long uploads (>15 min) fail because presigned URL expires before chunk upload completes.
**Why it happens:** Default presigned URL expiration is 15 minutes; large files on slow connections take longer.
**How to avoid:** Generate fresh presigned URL for each chunk just before upload (not all upfront). Set reasonable expiration (1 hour for video uploads).
**Warning signs:** Uploads fail at random percentages with 403 errors, more common on slow connections.

### Pitfall 7: Duplicate Detection Race Condition
**What goes wrong:** Two staff members upload same file simultaneously, both pass duplicate check, two assets created.
**Why it happens:** Duplicate check happens before upload; asset record created after upload completes.
**How to avoid:** Use database unique constraint on file hash. Handle conflict gracefully by returning existing asset ID.
**Warning signs:** Duplicate assets in catalog despite duplicate detection being "enabled".

### Pitfall 8: Missing Platform Assignment for Music
**What goes wrong:** Music assets published without platform (Music Vine, Uppbeat, or both) being set.
**Why it happens:** Platform assignment is a separate workflow stage that can be skipped or forgotten.
**How to avoid:** Enforce platform selection in Platform Assignment stage before allowing transition to Final Approval. Default to "both" but require explicit confirmation.
**Warning signs:** Published music assets with null/undefined platform field.

## Code Examples

Verified patterns from official sources:

### Complete Upload Hook with Uppy
```typescript
// Source: https://uppy.io/docs/react/ + Phase 4 requirements
import Uppy from '@uppy/core'
import AwsS3 from '@uppy/aws-s3'
import { useState, useEffect, useCallback } from 'react'

interface UploadFile {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
  assetId?: string
}

interface UseUploaderOptions {
  onComplete?: (assetId: string, file: UploadFile) => void
  onError?: (file: UploadFile, error: Error) => void
}

export function useUploader(options: UseUploaderOptions = {}) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uppy] = useState(() => {
    const instance = new Uppy({
      restrictions: {
        maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
        allowedFileTypes: ['.mp3', '.wav', '.flac', '.mp4', '.mov', '.cube'],
      },
      autoProceed: false,
    })

    instance.use(AwsS3, {
      shouldUseMultipart: (file) => file.size > 100 * 1024 * 1024,
      getUploadParameters: async (file) => {
        const response = await fetch('/api/assets/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            size: file.size,
          }),
        })
        const { url, key } = await response.json()
        return { method: 'PUT', url, headers: {}, fields: { key } }
      },
      createMultipartUpload: async (file) => {
        const response = await fetch('/api/assets/multipart/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        })
        return response.json()
      },
      signPart: async (file, { key, uploadId, partNumber }) => {
        const response = await fetch('/api/assets/multipart/sign-part', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, uploadId, partNumber }),
        })
        return response.json()
      },
      completeMultipartUpload: async (file, { key, uploadId, parts }) => {
        await fetch('/api/assets/multipart/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, uploadId, parts }),
        })
        return {}
      },
      abortMultipartUpload: async (file, { key, uploadId }) => {
        await fetch('/api/assets/multipart/abort', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, uploadId }),
        })
      },
    })

    return instance
  })

  useEffect(() => {
    const handleFileAdded = (file: any) => {
      setFiles((prev) => [
        ...prev,
        {
          id: file.id,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: 'pending',
        },
      ])
    }

    const handleProgress = (file: any, progress: any) => {
      const percent = Math.round((progress.bytesUploaded / progress.bytesTotal) * 100)
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, progress: percent, status: 'uploading' } : f
        )
      )
    }

    const handleComplete = async (result: any) => {
      for (const file of result.successful) {
        // Create asset record after upload
        const response = await fetch('/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileKey: file.meta.key,
            filename: file.name,
            contentType: file.type,
            size: file.size,
          }),
        })
        const { id: assetId } = await response.json()

        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: 'complete', assetId } : f
          )
        )

        options.onComplete?.(assetId, files.find((f) => f.id === file.id)!)
      }

      for (const file of result.failed) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: 'error', error: file.error?.message } : f
          )
        )
      }
    }

    uppy.on('file-added', handleFileAdded)
    uppy.on('upload-progress', handleProgress)
    uppy.on('complete', handleComplete)

    return () => {
      uppy.off('file-added', handleFileAdded)
      uppy.off('upload-progress', handleProgress)
      uppy.off('complete', handleComplete)
    }
  }, [uppy, options])

  const addFiles = useCallback(
    (newFiles: File[]) => {
      newFiles.forEach((file) => {
        uppy.addFile({
          name: file.name,
          type: file.type,
          data: file,
        })
      })
    },
    [uppy]
  )

  const startUpload = useCallback(() => {
    uppy.upload()
  }, [uppy])

  const removeFile = useCallback(
    (fileId: string) => {
      uppy.removeFile(fileId)
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
    },
    [uppy]
  )

  const retryFile = useCallback(
    (fileId: string) => {
      uppy.retryUpload(fileId)
    },
    [uppy]
  )

  return {
    files,
    addFiles,
    startUpload,
    removeFile,
    retryFile,
    isUploading: files.some((f) => f.status === 'uploading'),
  }
}
```

### Asset Types with Discriminated Union
```typescript
// Source: TypeScript handbook + CONTEXT type definitions
import type { Platform } from './platform'

// Base asset types
export type AssetType = 'music' | 'sfx' | 'motion-graphics' | 'lut' | 'stock-footage'

// Music workflow has more stages
export type MusicWorkflowState =
  | 'draft'
  | 'submitted'
  | 'initial_review'
  | 'quality_check'
  | 'platform_assignment'
  | 'final_approval'
  | 'published'
  | 'rejected_initial'
  | 'rejected_quality'
  | 'rejected_final'

// Simple workflow for non-music assets
export type SimpleWorkflowState = 'draft' | 'submitted' | 'review' | 'published' | 'rejected'

// Common asset fields
interface BaseAsset {
  id: string
  title: string
  description?: string
  contributorId: string
  contributorName: string
  fileKey: string
  fileUrl: string
  fileSize: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
  submittedAt?: Date
  approvedAt?: Date
  publishedAt?: Date
}

// Music asset with full workflow and both-platform support
export interface MusicAsset extends BaseAsset {
  type: 'music'
  platform: Platform | 'both'
  status: MusicWorkflowState
  genre: string
  bpm?: number
  key?: string
  duration: number
  instruments?: string[]
}

// Non-music assets with simple workflow and Uppbeat-only
export interface SfxAsset extends BaseAsset {
  type: 'sfx'
  platform: 'uppbeat'
  status: SimpleWorkflowState
  category: string
  duration: number
}

export interface MotionGraphicsAsset extends BaseAsset {
  type: 'motion-graphics'
  platform: 'uppbeat'
  status: SimpleWorkflowState
  resolution: string
  duration: number
  format: string
}

export interface LutAsset extends BaseAsset {
  type: 'lut'
  platform: 'uppbeat'
  status: SimpleWorkflowState
  format: string
  compatibleSoftware: string[]
}

export interface StockFootageAsset extends BaseAsset {
  type: 'stock-footage'
  platform: 'uppbeat'
  status: SimpleWorkflowState
  resolution: string
  duration: number
  frameRate: number
}

// Discriminated union
export type Asset = MusicAsset | SfxAsset | MotionGraphicsAsset | LutAsset | StockFootageAsset

// Type guards
export function isMusicAsset(asset: Asset): asset is MusicAsset {
  return asset.type === 'music'
}

export function hasMultiStageWorkflow(asset: Asset): asset is MusicAsset {
  return asset.type === 'music'
}
```

### File Validation Before Upload
```typescript
// Source: Combined patterns for CONTEXT requirements
interface ValidationResult {
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

async function validateFile(file: File, assetType: AssetType): Promise<ValidationResult> {
  const errors: string[] = []
  const metadata: ValidationResult['metadata'] = {}

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!allowedTypes[assetType]?.includes(extension)) {
    errors.push(`Invalid file type. Allowed: ${allowedTypes[assetType].join(', ')}`)
  }

  // Check file size (5GB max)
  const maxSize = 5 * 1024 * 1024 * 1024
  if (file.size > maxSize) {
    errors.push(`File too large. Maximum size: 5GB`)
  }

  // Extract metadata if file type is valid
  if (errors.length === 0) {
    try {
      if (assetType === 'music' || assetType === 'sfx') {
        const mediaData = await extractMediaMetadata(file)
        metadata.duration = mediaData.duration

        // BPM detection for music only
        if (assetType === 'music') {
          try {
            metadata.bpm = await detectBPM(file)
          } catch (e) {
            // BPM detection can fail for some files; not a blocking error
            console.warn('BPM detection failed:', e)
          }
        }
      } else if (['motion-graphics', 'stock-footage'].includes(assetType)) {
        const mediaData = await extractMediaMetadata(file)
        metadata.duration = mediaData.duration
        if (mediaData.width && mediaData.height) {
          metadata.resolution = `${mediaData.width}x${mediaData.height}`
        }
      }
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
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate @uppy/aws-s3-multipart | Unified @uppy/aws-s3 with shouldUseMultipart | Uppy 4.0 (2024) | Single plugin, simpler config, automatic threshold switching |
| FormData uploads through API | Direct S3 presigned URL uploads | 2020+ | 2x faster, reduced server load, resumable |
| Manual XMLHttpRequest progress | Uppy progress events | Established | Consistent progress across upload types |
| Server-side audio metadata | Browser music-metadata library | music-metadata 8.0 (ESM) | No server round-trip, instant validation |
| Polling for BPM detection | Web Audio beat detector | Established | Client-side, no server cost |

**Deprecated/outdated:**
- **@uppy/aws-s3-multipart**: Deprecated in Uppy 4.0, merged into @uppy/aws-s3 with shouldUseMultipart option
- **Fine Uploader**: Acquired and discontinued 2018, use Uppy instead
- **react-fine-uploader**: Deprecated with Fine Uploader
- **XHR-based uploads**: Still work but presigned URLs are the modern pattern

## Open Questions

Things that couldn't be fully resolved:

1. **Waveform generation: client vs server**
   - What we know: WaveSurfer.js can decode and render on client; backend could pre-generate peaks
   - What's unclear: Whether backend ingestion pipeline will provide pre-computed peaks
   - Recommendation: Start with client-side WaveSurfer.js decoding. If backend provides peaks, switch to peaks-only mode for faster initial render.

2. **Maximum concurrent uploads**
   - What we know: Uppy defaults to 3 concurrent uploads; S3 multipart allows 10,000 parts
   - What's unclear: Optimal balance for typical contributor network conditions
   - Recommendation: Start with Uppy default (3 concurrent). Monitor and adjust based on error rates and upload times.

3. **File hashing for very large files (>1GB)**
   - What we know: Synchronous hashing blocks UI; web workers add complexity
   - What's unclear: Typical file sizes for video uploads, acceptable validation delay
   - Recommendation: Show progress indicator during hash. If files routinely exceed 1GB, implement web worker. For MVP, synchronous is acceptable with clear loading state.

4. **Approval notification mechanism**
   - What we know: In-app notifications are in scope; email notifications mentioned in CONTEXT
   - What's unclear: Whether email notifications are Phase 4 scope or deferred
   - Recommendation: Build in-app notification infrastructure. Mock email notifications. Backend team will implement actual email delivery.

5. **Platform assignment default**
   - What we know: CONTEXT says default is "both platforms" for music
   - What's unclear: Whether UI should pre-select "both" or require explicit choice
   - Recommendation: Pre-select "both" in Platform Assignment stage with clear labeling. Audit log tracks if changed from default.

## Sources

### Primary (HIGH confidence)
- [Uppy Official Docs](https://uppy.io/docs/) - AWS S3 plugin, multipart configuration, React integration
- [Uppy 4.0 Migration Guide](https://uppy.io/docs/guides/migration-guides/) - Unified S3 plugin changes
- [Uppy AWS S3 Plugin Source](https://github.com/transloadit/uppy/tree/main/packages/%40uppy/aws-s3) - Multipart implementation details
- [react-dropzone GitHub](https://github.com/react-dropzone/react-dropzone) - API, examples, version 14.x
- [WaveSurfer.js Official](https://wavesurfer.xyz/) - Version 7.x documentation
- [@wavesurfer/react](https://github.com/katspaugh/wavesurfer-react) - React hooks wrapper
- [web-audio-beat-detector GitHub](https://github.com/chrisguttandin/web-audio-beat-detector) - API documentation
- [music-metadata GitHub](https://github.com/Borewit/music-metadata) - Browser support, ESM migration
- [MDN: Web Crypto API digest](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest) - SHA-256 hashing
- [MDN: loadedmetadata event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/loadedmetadata_event) - Media duration extraction
- [AWS S3 Multipart Upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html) - Official AWS documentation

### Secondary (MEDIUM confidence)
- [Transloadit Blog: Hash Files with Web Crypto](https://transloadit.com/devtips/hash-files-in-the-browser-with-web-crypto/) - File hashing patterns
- [AWS Blog: Multipart Upload with Transfer Acceleration](https://aws.amazon.com/blogs/compute/uploading-large-objects-to-amazon-s3-using-multipart-upload-and-transfer-acceleration/) - Best practices
- [DEV.to: S3 Multipart with Presigned URLs](https://dev.to/magpys/upload-large-files-to-aws-s3-using-multipart-upload-and-presigned-urls-4olo) - Implementation walkthrough
- [react-tag-autocomplete npm](https://www.npmjs.com/package/react-tag-autocomplete) - API and usage
- [MUI Timeline Component](https://mui.com/material-ui/react-timeline/) - Timeline UI patterns
- [MUI Stepper Component](https://mui.com/material-ui/react-stepper/) - Workflow progress UI

### Tertiary (LOW confidence)
- [Medium: WaveSurfer.js with React](https://medium.com/trackstack/simple-audio-waveform-with-wavesurfer-js-and-react-ae6c0653b240) - React integration patterns
- [Medium: Beat Detection with Web Audio API](https://jmperezperez.com/beats-audio-api/) - BPM algorithm explanation
- [GitHub: S3 Multipart Presigned Example](https://github.com/victorcruz86/multipart-aws-presigned) - Implementation reference

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified through official docs, npm, and GitHub. Current versions confirmed for 2026.
- Architecture patterns: HIGH - Patterns verified with Uppy docs, WaveSurfer examples, and TypeScript best practices. S3 multipart flow confirmed with AWS documentation.
- Pitfalls: MEDIUM - Based on community experience (GitHub issues, Stack Overflow), AWS documentation, and general upload best practices. Some require production validation.

**Research date:** 2026-02-09
**Valid until:** 2026-03-09 (30 days - stable ecosystem with mature upload libraries)

**Notes for planner:**
- CONTEXT decisions are comprehensive and locked: Uppy for uploads, multipart with presigned URLs, client-side validation, fixed workflow stages
- Claude's Discretion areas: specific UI layouts for upload progress, waveform styling, timeline visual design, exact validation error messages
- Main dependencies: @uppy/core, @uppy/aws-s3, react-dropzone, wavesurfer.js, web-audio-beat-detector, music-metadata, react-tag-autocomplete
- Backend integration points: presigned URL endpoints, multipart lifecycle endpoints, duplicate check endpoint, asset CRUD endpoints, workflow action endpoints
- Risk areas: CORS configuration for ETag (must verify with backend), large file hashing performance (may need web worker), AudioContext limits (queue BPM detection)
- Reuse from Phase 2/3: virtualized table patterns, pagination, filters, keyboard navigation, empty states, command palette integration
