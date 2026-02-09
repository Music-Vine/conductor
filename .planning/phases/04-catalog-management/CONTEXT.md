---
phase: 04-catalog-management
discussed: 2026-02-09
status: ready_for_research
---

# Phase 4: Catalog Management — Context

**Phase Goal:** Staff can manage complete asset lifecycle from ingestion through approval workflows to publication

**Requirements Coverage:** CATA-01 through CATA-12

**Success Criteria:**
1. Contributors can upload assets via UI which flow to S3 and trigger ingestion pipeline
2. Staff can view all submitted assets with server-side pagination and filtering
3. Staff can approve music assets through multi-stage workflow with multiple reviewers and feedback rounds
4. Staff can approve SFX, motion graphics, LUTs, and stock footage through single-stage workflow
5. Staff can edit asset metadata (titles, tags, genres) and set platform exclusivity
6. Staff can organize assets into collections and playlists, handle takedowns, and export catalog data

## Domain Understanding

### Asset Types

**Music (Multi-stage workflow, both platforms):**
- Most complex approval process
- Can be assigned to Music Vine only, Uppbeat only, or both platforms (default: both)
- Platform assignment happens after approval, before publish (dedicated workflow stage)
- Type-specific metadata: BPM, key, tempo, instruments

**SFX (Simple workflow, Uppbeat exclusive):**
- Single-stage approval
- Uppbeat only (cannot be changed)
- Type-specific metadata: duration, category

**Motion Graphics (Simple workflow, Uppbeat exclusive):**
- Single-stage approval
- Uppbeat only (cannot be changed)
- Type-specific metadata: resolution, duration, format

**LUTs (Simple workflow, Uppbeat exclusive):**
- Single-stage approval
- Uppbeat only (cannot be changed)
- Type-specific metadata: format, compatible software

**Stock Footage (Simple workflow, Uppbeat exclusive):**
- Single-stage approval
- Uppbeat only (cannot be changed)
- Type-specific metadata: resolution, duration, frame rate

### Current Workflow (to replace)

**Music Vine admin (legacy PHP):**
- Contributor uploads via UI
- Manual Google Sheets process for tracking
- Multiple approval rounds with email communication
- Eventually added to Uppbeat manually
- Slow, buggy, unmaintained

**Target workflow:**
- Contributor uploads via Conductor UI
- Files → S3 bucket via API
- S3 upload triggers backend ingestion pipeline
- Assets appear in Conductor for staff review
- Multi-stage approval with in-app feedback
- Platform assignment before publish
- Automatic publishing to assigned platform(s)

## Implementation Decisions

### Upload Interface & File Handling

**Multi-file uploads:**
- Batch upload with shared metadata
- Select multiple files, apply common metadata (contributor, genre, tags) to all
- Upload files in parallel
- Faster for bulk uploads while maintaining consistency

**File validation (before upload starts):**
- File type/extension checking (.mp3, .wav, .mov, .mp4, .cube, etc.)
- Client-side audio/video probing to extract duration, bitrate, sample rate, resolution
- Duplicate detection via client-side file hashing against existing assets
- Prevents wrong formats, corrupted files, and duplicate uploads

**Upload progress:**
- Detailed per-file progress list
- Show each file's upload state, bytes transferred, ETA
- Individual retry buttons per file
- Takes more space but provides clear visibility for debugging

**Upload error recovery:**
- Resumable uploads with checkpoints
- Upload in chunks, save progress
- Allow resuming from last successful chunk
- Essential for large video files with unreliable connections

### Asset Metadata

**Metadata schema:**
- Core shared + type-specific approach
- Common fields for all types: title, description, tags, contributor, platform
- Type-specific fields: BPM/key for music, resolution for video, format for LUTs
- Recommended approach balances consistency and specificity

**Genre/category taxonomy:**
- Hybrid: primary genre + mood tags
- Required single primary genre dropdown (Rock, Electronic, Cinematic, etc.)
- Optional mood/instrument/style tags (Uplifting, Piano, Retro, etc.)
- Balance of structure (genre) and flexibility (tags)

**Field requirements:**
- Type-specific requirements
- Music requires: title, file, contributor, genre, BPM, key
- Video requires: title, file, contributor, genre, resolution, duration
- SFX requires: title, file, contributor, category, duration
- Different required fields per type ensures quality metadata

**Metadata history:**
- Audit log only (no versioning)
- Track who changed what and when in audit log
- Cannot view previous versions or revert
- Sufficient for accountability without storage overhead

### Approval Workflows

**Music workflow (multi-stage):**
- Fixed linear stages: Submitted → Initial Review → Quality Check → Platform Assignment → Final Approval → Published
- Must pass each stage to proceed
- Platform Assignment is a dedicated stage after Quality Check
- Predictable process, clear stage gates

**Reviewer feedback:**
- Hybrid: checklist + comments
- Required checklist items for common issues (audio quality, tagging accuracy, rights clearance)
- Optional comment field for specific feedback
- Balance of structure (checklist) and flexibility (comments)

**Rejection handling:**
- Staff can fix minor issues directly
- For small metadata errors, staff corrects without rejecting
- Only reject for issues requiring contributor action (re-recording, rights issues)
- Efficient, reduces round-trips

**Simple workflows (SFX, video, LUTs, stock footage):**
- Separate simplified workflow
- Submitted → Review → Published (single approval step)
- Different workflow code from music
- Simpler but maintain two workflow systems

### Platform Exclusivity

**Music assets:**
- Platform assignment happens after approval, before publish
- Dedicated "Platform Assignment" workflow stage
- Default: both platforms (Music Vine + Uppbeat)
- Staff can change anytime from asset detail page
- Audit log tracks all platform changes

**Non-music assets:**
- All non-music assets are Uppbeat exclusive
- Cannot be changed (hardcoded)
- Music Vine only supports music
- No UI for changing platform on SFX/video/LUTs/stock footage

### Asset Organization

**Collections:**
- Collections only (no separate playlist concept)
- Collections are curated groups of assets (e.g., "Summer Vibes 2026", "Piano Instrumentals")
- Staff creates collections and adds/removes assets
- Assets can belong to multiple collections
- Collections have metadata: title, description, cover image

**Takedowns:**
- Simple unpublish button
- Staff clicks "unpublish" on asset detail page
- Asset immediately hidden from users
- No reason required, no approval workflow
- Fast for urgent takedowns (DMCA, rights issues)

**Bulk operations:**
- No bulk editing in Phase 4
- Defer to Phase 5 (Bulk Operations)
- Phase 4 focuses on individual asset workflows
- Simpler scope, faster delivery

**Export:**
- CSV export of asset list (per CATA-12)
- Works like user CSV export from Phase 2
- Respects current filters/search
- Columns: ID, title, type, status, contributor, platform, upload date, approval date

## Technical Approach

### File Upload Flow

1. User selects files via file picker or drag-drop
2. Client validates file types/extensions
3. Client extracts metadata via browser APIs (duration, resolution)
4. Client hashes files and checks for duplicates via API
5. User fills shared metadata form (contributor, genre, tags)
6. Client uploads files to S3 via presigned URLs from API
7. Chunked uploads with progress tracking
8. On completion, client notifies API with file keys
9. API creates asset records in database
10. Backend ingestion pipeline processes files (triggered by S3 event or API webhook)

### Workflow State Machine

**Music workflow states:**
- `draft` → `submitted` → `initial_review` → `quality_check` → `platform_assignment` → `final_approval` → `published`
- `rejected_initial` (from initial_review, needs resubmission)
- `rejected_quality` (from quality_check, needs resubmission)
- `rejected_final` (from final_approval, needs resubmission)

**Simple workflow states:**
- `draft` → `submitted` → `review` → `published`
- `rejected` (from review, needs resubmission)

**Workflow actions:**
- Approve: move to next stage
- Reject: move to rejected state, notify contributor
- Fix metadata: staff edits without changing state
- Request changes: add feedback, keep in current state

### Data Model (TypeScript types)

**Asset:**
```typescript
type AssetType = 'music' | 'sfx' | 'motion-graphics' | 'lut' | 'stock-footage'
type Platform = 'music-vine' | 'uppbeat' | 'both'
type WorkflowState = 'draft' | 'submitted' | 'initial_review' | 'quality_check' |
                     'platform_assignment' | 'final_approval' | 'published' |
                     'rejected_initial' | 'rejected_quality' | 'rejected_final'

interface Asset {
  id: string
  type: AssetType
  title: string
  description?: string
  contributorId: string
  contributorName: string
  platform: Platform // 'both' for music default, 'uppbeat' for others
  status: WorkflowState

  // Files
  fileKey: string // S3 key
  fileUrl: string // Presigned URL
  fileSize: number

  // Common metadata
  genre: string
  tags: string[]

  // Type-specific metadata (discriminated union or separate fields)
  bpm?: number // music only
  key?: string // music only
  duration?: number // music, sfx, video, stock footage
  resolution?: string // video, motion graphics, stock footage

  // Workflow
  submittedAt?: Date
  approvedAt?: Date
  publishedAt?: Date
  currentReviewerId?: string

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

**WorkflowAction:**
```typescript
interface WorkflowAction {
  id: string
  assetId: string
  reviewerId: string
  reviewerName: string
  action: 'approve' | 'reject' | 'request_changes' | 'fix_metadata'
  fromState: WorkflowState
  toState: WorkflowState
  checklist?: ChecklistItem[]
  comments?: string
  createdAt: Date
}

interface ChecklistItem {
  item: string // e.g., "Audio quality acceptable"
  checked: boolean
}
```

**Collection:**
```typescript
interface Collection {
  id: string
  title: string
  description?: string
  coverImageUrl?: string
  platform: Platform
  assetIds: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
```

## UI Patterns

### Pages/Routes

- `/assets` — Asset list page with filters (type, status, platform, genre)
- `/assets/upload` — Upload interface for new assets
- `/assets/[id]` — Asset detail page with tabs:
  - Overview: metadata, preview, platform badge
  - Workflow: approval history, current stage, actions
  - Collections: which collections contain this asset
  - Activity: audit log of all changes
- `/collections` — Collections list page
- `/collections/[id]` — Collection detail page with asset grid

### Components

**AssetTable:**
- TanStack Table with virtualization (reuse Phase 3 patterns)
- Columns: thumbnail, title, type, contributor, status, platform, uploaded date
- Filters: type dropdown, status dropdown, platform toggle, genre dropdown, search
- Row actions: view details, quick approve (non-music), unpublish

**AssetUploadForm:**
- Drag-drop file zone
- File list with per-file progress
- Shared metadata form (contributor select, genre dropdown, tags input)
- Batch submit button
- Shows validation errors per file

**WorkflowTimeline:**
- Vertical timeline showing workflow stages
- Completed stages: green checkmark
- Current stage: blue indicator
- Future stages: gray
- Each stage shows: reviewer, timestamp, feedback

**ApprovalForm:**
- Current stage header
- Checklist items with checkboxes
- Comments textarea
- Action buttons: Approve, Reject, Request Changes
- Only shown when user is assigned reviewer

**AssetPreview:**
- Music: waveform + play button
- Video: video player
- Images: full-size preview
- LUTs: before/after comparison (if backend provides)

## Integration Points

### API Endpoints (to be mocked)

**Upload:**
- `POST /api/assets/presigned-url` — Get S3 presigned URL for upload
- `POST /api/assets/check-duplicates` — Check file hashes against existing
- `POST /api/assets` — Create asset record after upload completes
- `POST /api/assets/batch` — Create multiple assets (batch upload)

**Asset Management:**
- `GET /api/assets` — List assets with pagination/filters
- `GET /api/assets/:id` — Get asset detail
- `PATCH /api/assets/:id` — Update asset metadata
- `POST /api/assets/:id/unpublish` — Unpublish asset
- `GET /api/assets/export` — Export filtered assets to CSV

**Workflow:**
- `GET /api/assets/:id/workflow` — Get workflow history
- `POST /api/assets/:id/approve` — Approve at current stage
- `POST /api/assets/:id/reject` — Reject at current stage
- `POST /api/assets/:id/assign-platform` — Set platform (Platform Assignment stage)

**Collections:**
- `GET /api/collections` — List collections
- `GET /api/collections/:id` — Get collection detail
- `POST /api/collections` — Create collection
- `PATCH /api/collections/:id` — Update collection
- `POST /api/collections/:id/assets` — Add assets to collection
- `DELETE /api/collections/:id/assets/:assetId` — Remove asset from collection

### Backend Ingestion Pipeline

Conductor frontend is not responsible for the ingestion pipeline itself. The flow:

1. Conductor uploads file to S3
2. S3 event or API webhook triggers backend ingestion
3. Backend processes file (extract metadata, generate waveform, transcode)
4. Backend updates asset record with processed data
5. Conductor polls or receives webhook when processing completes

Conductor only needs to:
- Show "processing" state while backend works
- Poll for completion or listen for webhook
- Display error if processing fails

## Open Questions

None at this time. All gray areas discussed and decisions made.

## References

- Phase 2 User Management: Established patterns for data tables, pagination, filtering, CSV export
- Phase 3 Advanced Table Features: Virtualization, keyboard shortcuts, command palette integration
- Requirements: CATA-01 through CATA-12 in REQUIREMENTS.md
- Roadmap: Phase 4 success criteria in ROADMAP.md

---
*Context gathered: 2026-02-09*
*Ready for: Research phase*
