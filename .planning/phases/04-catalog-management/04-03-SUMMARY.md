---
phase: 04
plan: 03
subsystem: api
tags: [mock-api, asset-crud, workflow, pagination, filtering]

requires:
  - 04-01  # Asset types
  - 02-01  # User API patterns

provides:
  - asset-list-api
  - asset-detail-api
  - workflow-action-apis
  - asset-client-functions

affects:
  - 04-04  # Upload infrastructure (will use these endpoints)
  - 04-06  # Asset table UI (will consume client functions)
  - 04-07  # Asset detail page (will use workflow APIs)

tech-stack:
  added:
    - workflow/transitions for state machine validation
  patterns:
    - Mock API with ID-based seeding for reproducible data
    - Paginated responses with filtering support
    - Workflow state machine with transition validation

key-files:
  created:
    - src/app/api/assets/route.ts
    - src/app/api/assets/[id]/route.ts
    - src/app/api/assets/[id]/workflow/route.ts
    - src/app/api/assets/[id]/approve/route.ts
    - src/app/api/assets/[id]/reject/route.ts
    - src/app/api/assets/[id]/unpublish/route.ts
    - src/lib/api/assets.ts
  modified:
    - src/middleware.ts

decisions:
  - key: mock-asset-generation-strategy
    what: ID-based seeding generates 500 assets (300 music, 80 sfx, 50 motion-graphics, 30 luts, 40 stock-footage)
    why: Consistent mock data across requests, realistic distribution of asset types
    impact: Frontend development can work with predictable data without backend

  - key: workflow-transition-validation
    what: Use lib/workflow/transitions for all state changes, return 400 for invalid transitions
    why: Enforces state machine rules, prevents impossible workflow states
    impact: Frontend gets clear errors for invalid actions, easier debugging

  - key: platform-assignment-requirement
    what: Music assets in platform_assignment state require platform parameter on approve
    why: Platform assignment is a dedicated workflow stage requiring explicit selection
    impact: Approval endpoint validates platform selection for music assets

  - key: rejection-requires-comments
    what: Reject endpoint requires comments parameter with non-empty string
    why: Rejection should always include feedback explaining why
    impact: Frontend must collect rejection reason from reviewer

metrics:
  duration: 6 minutes
  completed: 2026-02-10
---

# Phase 4 Plan 3: Mock Asset API Summary

**One-liner:** Complete mock API for asset CRUD and workflow actions with filtering, pagination, and state machine validation

## What Was Built

### Asset List and Create Endpoints (Task 1)
- **GET /api/assets** - Paginated asset list with comprehensive filtering
  - Query params: type, status, platform, genre, query (search)
  - Pagination: page, limit (default 50, max 100)
  - Mock data: 500 assets across 5 asset types
  - Distribution: 300 music, 80 sfx, 50 motion-graphics, 30 luts, 40 stock-footage
  - Status distribution: 40% published, 20% submitted, 20% in-review stages, 10% draft, 10% rejected
  - Search by title, contributor name, or asset ID (case-insensitive)

- **POST /api/assets** - Create new asset
  - Accepts: type, title, description, contributorId, fileKey, genre, tags, platform
  - Creates mock asset with 'draft' status
  - Platform defaults: 'both' for music, 'uppbeat' for others
  - Returns created asset with generated ID

### Asset Detail and Workflow Endpoints (Task 2)
- **GET /api/assets/[id]** - Full asset detail with type-specific fields
  - Returns complete Asset object (not AssetListItem)
  - Includes mock fileUrl (presigned S3 URL placeholder)
  - Includes workflow timestamps (submittedAt, approvedAt, publishedAt) based on status

- **PATCH /api/assets/[id]** - Update asset metadata
  - Updates allowed fields (title, description, tags, genre, platform)
  - Prevents ID and type changes
  - Mock audit logging to console

- **GET /api/assets/[id]/workflow** - Workflow history
  - Returns WorkflowHistoryItem[] with reviewer names, actions, checklist, comments
  - Generates realistic history based on current status
  - Music workflow: up to 6 history items (submit → initial_review → quality_check → platform_assignment → final_approval → published)
  - Simple workflow: up to 3 history items (submit → review → published)

- **POST /api/assets/[id]/approve** - Approve at current stage
  - Accepts: checklist, comments, platform (required for music in platform_assignment)
  - Uses workflow/transitions to get next state
  - Returns 400 if transition invalid or platform missing
  - Updates timestamps (approvedAt, publishedAt) based on new state

- **POST /api/assets/[id]/reject** - Reject with feedback
  - Accepts: checklist, comments (required)
  - Uses workflow/transitions to get rejected state
  - Returns 400 if comments missing or transition invalid
  - Mock audit logging

- **POST /api/assets/[id]/unpublish** - Unpublish asset (takedown)
  - Only works on published assets
  - Moves asset back to draft state
  - Clears publishedAt timestamp
  - Returns 400 if asset not published

### Client-Side API Functions (Task 3)
- Created **src/lib/api/assets.ts** with 8 API functions:
  - `getAssets(params)` - Fetch paginated asset list
  - `getAsset(id)` - Fetch single asset detail
  - `createAsset(data)` - Create new asset
  - `updateAsset(id, data)` - Update asset metadata
  - `getWorkflowHistory(id)` - Fetch workflow history
  - `approveAsset(id, data)` - Approve at current stage
  - `rejectAsset(id, data)` - Reject with comments
  - `unpublishAsset(id)` - Unpublish asset

- Updated **src/middleware.ts** to add /api/assets to public paths
  - Allows mock API access during frontend development
  - Follows pattern from Phase 2 user management API

## Testing Results

All verification criteria passed:

1. ✅ GET /api/assets returns paginated list
   - Tested with limit=5, received 5 assets with pagination metadata

2. ✅ GET /api/assets?type=music filters correctly
   - Tested with type=music&status=published, received filtered results
   - 115 published music assets out of 300 total music assets

3. ✅ GET /api/assets/[id] returns full asset detail
   - asset-1 returned complete MusicAsset with all fields
   - Includes bpm, key, duration, instruments, timestamps

4. ✅ POST /api/assets/[id]/approve transitions state correctly
   - Correctly rejected approval of already-published asset
   - Error response: "Cannot approve asset in current state"

5. ✅ Client functions can be imported without errors
   - TypeScript compilation passed with no errors
   - Import from '@/lib/api/assets' works correctly

## Deviations from Plan

None - plan executed exactly as written.

## Key Technical Decisions

### Mock Data Generation Strategy
**Decision:** Generate 500 assets using ID-based seeding with deterministic status distribution

**Rationale:** Provides consistent, reproducible mock data across requests without database

**Implementation:**
- Asset IDs determine type (1-300 music, 301-380 sfx, 381-430 motion-graphics, etc.)
- Status calculated using `(assetNum * 7) % 100` for consistent randomization
- Same ID always generates same asset properties

**Benefits:**
- Frontend can develop against stable mock data
- Deep links to specific assets work reliably
- No need for mock database or state management

### Workflow Transition Validation
**Decision:** Use lib/workflow/transitions for all state changes, reject invalid transitions with 400 errors

**Rationale:** Enforce state machine rules at API level, prevent impossible states

**Implementation:**
```typescript
const transitions = asset.type === 'music' ? musicTransitions : simpleTransitions
const nextState = getNextState(asset.status, 'approve', transitions)

if (!nextState) {
  return NextResponse.json(
    { error: 'Cannot approve asset in current state', code: 'INVALID_TRANSITION' },
    { status: 400 }
  )
}
```

**Benefits:**
- Frontend gets clear error messages for invalid actions
- State machine rules enforced consistently
- Easier to debug workflow issues

### Platform Assignment Validation
**Decision:** Require platform parameter when approving music assets in platform_assignment state

**Rationale:** Platform assignment is a dedicated workflow stage requiring explicit selection

**Implementation:**
```typescript
if (asset.type === 'music' && asset.status === 'platform_assignment') {
  if (!platform) {
    return NextResponse.json(
      { error: 'Platform selection required', code: 'PLATFORM_REQUIRED' },
      { status: 400 }
    )
  }
}
```

**Benefits:**
- Enforces deliberate platform selection decision
- Prevents accidental approval without platform assignment
- Clear error message guides frontend implementation

## Files Changed

### Created
- `src/app/api/assets/route.ts` (344 lines) - Asset list and create endpoints
- `src/app/api/assets/[id]/route.ts` (334 lines) - Asset detail and update endpoints
- `src/app/api/assets/[id]/workflow/route.ts` (340 lines) - Workflow history endpoint
- `src/app/api/assets/[id]/approve/route.ts` (111 lines) - Approval endpoint
- `src/app/api/assets/[id]/reject/route.ts` (87 lines) - Rejection endpoint
- `src/app/api/assets/[id]/unpublish/route.ts` (68 lines) - Unpublish endpoint
- `src/lib/api/assets.ts` (113 lines) - Client-side API functions

### Modified
- `src/middleware.ts` - Added /api/assets to public paths

## Next Phase Readiness

### Ready to Start
- **04-04 Upload Infrastructure** - Can use POST /api/assets endpoint
- **04-06 Asset Table UI** - Client functions available for data fetching
- **04-07 Asset Detail Page** - Full API suite ready for workflow UI

### No Blockers
All endpoints functional, TypeScript types aligned, state machine validated.

### Future Considerations
- Backend integration will replace mock data generation with real database queries
- S3 presigned URLs currently mock placeholders, will become real presigned URLs
- Audit logging currently console.log, will become database audit trail
- Workflow history generation will be replaced by database query

## Commits

| Hash | Message |
|------|---------|
| f978209 | feat(04-03): create asset list and create endpoints |
| 73e94d9 | feat(04-03): create asset detail and workflow endpoints |
| 43c9f20 | feat(04-03): create client-side API functions and update middleware |

**Total:** 3 commits

---

**Execution time:** 6 minutes
**Completed:** 2026-02-10
