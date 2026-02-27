# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-03)

**Core value:** Enable staff to add and manage assets quickly and reliably through a single admin interface
**Current focus:** Phase 7 - Enhanced UX & Power Features

## Current Position

Phase: 7 of 8 (Enhanced UX & Power Features)
Plan: 0 of TBD in current phase
Status: Phase 6 complete, Phase 7 not started
Last activity: 2026-02-27 — Completed Phase 6 (Payee & Contributor Management) — all 8 plans verified

Progress: [███████████████████████░░] 97% (66 of 68 plans completed across all phases)

## Performance Metrics

**Velocity:**
- Total plans completed: 54
- Average duration: 6.15 minutes
- Total execution time: 5.54 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 15 | 47.82 min | 3.19 min |
| 2 | 11 | 70.09 min | 6.37 min |
| 3 | 11 | 155.82 min | 14.17 min |
| 4 | 9 | 49.18 min | 5.46 min |
| 5 | 8 | 35.67 min | 4.46 min |

**Recent Trend:**
- Last 5 plans: 05-05 (3.00 min), 05-06 (3.35 min), 05-07 (2.02 min), 05-08 (2.00 min)
- Trend: Phase 5 consistently fast - simple integration patterns, clear patterns established

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Frontend-first API design (mock endpoints, generate API requirements from UI)
- Individual staff logins with audit trails (vs current shared login)
- Platform toggle pattern for Music Vine vs Uppbeat data
- Defer content/SEO/permissions to Phase 2
- Use Cadence design system
- jose library chosen for JWT (Edge runtime compatible) - 01-01
- Platform type: 'music-vine' | 'uppbeat' string literal union - 01-01
- 13 AuditAction types for comprehensive audit trails - 01-01
- Next.js App Router error boundary conventions (error.tsx, global-error.tsx) - 01-02
- CSS variables for skeleton theming to support dark mode - 01-02
- BaseSkeleton wrapper for consistent skeleton styling across components - 01-02
- atomWithStorage from jotai/utils for platform persistence - 01-04
- ThemeProvider sets data-platform attribute and CSS custom properties - 01-04
- Graceful audit logging with dynamic import and catch block - 01-04
- QueryClient with 60s staleTime, no window focus refetch for admin app - 01-05
- credentials: include for cookie-based authentication on all API requests - 01-05
- ApiClientError structure with code, status, details for error handling - 01-05
- Magic link tokens expire after 15 minutes for security - 01-06
- Remember Me preference stored in magic link token for callback - 01-06
- Development mode logs magic link URLs to console for testing - 01-06
- Mock user sessions with crypto.randomUUID() until database implemented - 01-06
- Logout supports both POST and GET methods for flexibility - 01-06
- Blur validation with onChange after first error for optimal UX - 01-08
- Red border + error icon for invalid fields, green checkmark for valid - 01-08
- Type assertions for zodResolver due to generic constraint limitations - 01-08
- Server-client layout split for session validation and providers - 01-09
- Platform route group (platform) for all authenticated pages - 01-09
- UserMenu dropdown with click-outside detection and user avatar - 01-09
- Manual verification checkpoint pattern for complex interactive flows - 01-10
- Seven comprehensive test scenarios for Phase 1 foundation verification - 01-10
- Routing fix: removed default Next.js page to allow dashboard access - 01-10
- Cadence Design System (v1.1.2) for visual consistency with Uppbeat/Music Vine - 01-12
- Tailwind v4 CSS-based config with v3-style config file for Cadence compatibility - 01-12
- BaseSkeleton API changed from numeric pixels to Tailwind class strings - 01-12
- @tailwindcss/container-queries installed as Cadence peer dependency - 01-12
- Audit logging enabled in PlatformToggle with error logging for failures - 01-11
- HTML headings used instead of Cadence Heading component for semantic markup - 01-11
- Tailwind text utilities applied directly instead of Cadence size props - 01-11
- All form inputs/buttons use Cadence components (Input, Button) for consistency - 01-13
- Platform-specific brand colors: Uppbeat #F23D75 pink, Music Vine #ff5f6e coral - 01-13
- PlatformToggle active state uses bg-platform-primary for brand color feedback - 01-13
- Checkbox inputs remain native HTML (no Cadence checkbox component) - 01-13
- Tailwind CSS downgraded from v4 to v3.4.19 for Cadence compatibility - 01-14
- PostCSS configuration with tailwindcss and autoprefixer plugins - 01-14
- CSS import order: external imports (@music-vine/cadence) before @tailwind directives - 01-14
- @tailwind base/components/utilities directives replace v4 @import syntax - 01-14
- Cadence slate colors aliased as gray-* (50-950) in Tailwind config for familiarity - 01-15
- Systematic color token migration: all zinc-* classes replaced with gray-* - 01-15
- CSS variables wrapped in @layer base for proper Tailwind integration - 01-15
- All 16 UI files updated with valid Cadence color tokens - 01-15
- String literal unions for UserStatus and SubscriptionTier types (matches Platform pattern) - 02-01
- Mock user API endpoints added to public paths in middleware for frontend development - 02-01
- Consistent data generation using ID-based seeding for reproducible mock data - 02-01
- 100-200ms artificial latency to simulate realistic network conditions - 02-01
- Search button required to execute search (not debounced auto-search or keystroke search) - 02-03
- Filter dropdowns update URL immediately on change (different from button-triggered search) - 02-03
- Page resets to 1 when any filter changes for consistent UX - 02-03
- URL-based filter state management with Next.js 15 async searchParams pattern - 02-03
- TanStack Table with manual pagination mode for server-side data handling - 02-04
- URL search params for pagination state (shareable links, browser navigation) - 02-04
- Page size selector with 25/50/100 options, default 50 - 02-04
- Clean URLs: page param omitted when page=1, limit param omitted when limit=50 - 02-04
- Radix Tabs with URL search param synchronization for persistent tab state - 02-05
- Tab content placeholders until subsequent plans build actual sections - 02-05
- Avatar placeholder using first letter of email in circular background - 02-05
- API client checks for .data field before unwrapping (handles both ApiResponse and PaginatedResponse) - 02-05
- Platform badge colors: Music Vine red, Uppbeat pink for visual distinction - 02-06
- Suspended account details shown in red-themed alert box - 02-06
- OAuth disconnect uses simple confirmation dialog (not reason-required modal) - 02-06
- Audit logging deferred for API routes until session context available - 02-06
- Suspend/Unsuspend button placeholder for future implementation - 02-06
- Refund button uses Cadence Button variant='error' for destructive action styling - 02-07
- Billing history is mock data (3-5 entries) until backend integration - 02-07
- Free tier users do not see refund button - 02-07
- Refund endpoint mocks Stripe processing with 500ms delay - 02-07
- ActivityItem union type enables combined downloads + licenses timeline - 02-08
- Parallel queries for downloads/licenses improve perceived performance - 02-08
- Date grouping (Today/Yesterday/This Week/Older) for timeline scannability - 02-08
- Load more pagination (not infinite scroll) for explicit user control - 02-08
- 50 downloads per user, 20 licenses per user in mock data - 02-08
- 50% of licenses perpetual (null expiry), 50% with expiration dates - 02-08
- Simple confirmation dialogs for suspend/unsuspend (no reason required) - 02-09
- Nested SuspendUserDialog within DropdownMenu for reusable confirmation - 02-09
- Event propagation stopped for dropdown to prevent row click navigation - 02-09
- Mock audit logging to console until database integration - 02-09
- Timestamp format in CSV filenames uses ISO with hyphens for filesystem compatibility - 02-10
- Null/undefined values converted to empty strings in CSV output - 02-10
- Export button placed above results table, right-aligned - 02-10
- Toast notifications for export success/failure feedback - 02-10
- All 12 test scenarios passed manual verification for Phase 2 completion - 02-11
- User search, filtering, pagination verified working correctly - 02-11
- User detail tabs (Profile, Subscription, Downloads) verified functional - 02-11
- Account actions (Suspend/Unsuspend, OAuth disconnect, Refund) verified working - 02-11
- CSV export with filtering verified producing valid files - 02-11
- @tanstack/react-virtual 3.13.18 for row virtualization compatibility with TanStack Table - 03-01
- cmdk 1.1.1 for command palette with Radix Dialog integration - 03-01
- react-hotkeys-hook 5.2.1 for keyboard shortcut management with scoping - 03-01
- fuse.js 7.1.0 for fuzzy search in global search feature - 03-01
- Cadence Button 'bold' variant for primary actions (not 'primary') - 03-01
- Cadence Button 'subtle' variant for secondary actions (not 'outline') - 03-01
- Table shortcuts use single keys (j/k/space) for speed - only active when table focused - 03-02
- Form-safe shortcuts require modifiers (Cmd+N) to avoid input conflicts - 03-02
- Scope field enables context-aware activation for different UI regions - 03-02
- Input safety defaults to false - shortcuts disabled in form inputs unless explicitly enabled - 03-02
- cmdk Dialog component for command palette (built-in focus trap and portal) - 03-03
- Controlled/uncontrolled dual mode for CommandPalette flexible integration - 03-03
- OS-aware modifier key detection for cross-platform shortcuts (Cmd vs Ctrl) - 03-03
- Keyboard hints in command palette footer per CONTEXT decision - 03-03
- Command palette accessible via BOTH Cmd+K AND visible Header button - 03-03
- Navigation shortcuts format: G + letter (G D, G U, G A, G P) - 03-03
- Action shortcuts format: Cmd + letter (Cmd+N, Cmd+E) - 03-03
- Fixed row height (52px) for virtualization - simpler and faster than dynamic - 03-05
- Overscan of 10 rows for smooth scrolling without blank space - 03-05
- Smart scroll reset: reset on filter/sort, preserve on refresh, restore on back - 03-05
- VirtualizedRow component handles absolute positioning math with translateY - 03-05
- EmptyState uses Cadence Button 'bold' variant for primary actions - 03-04
- EmptyState uses Cadence Button 'subtle' variant for secondary actions - 03-04
- Pre-configured empty state variants (NoResults, FirstUse, Error, Success) for common patterns - 03-04
- SVG icons embedded for each empty state type with optional override capability - 03-04
- Client-side fuzzy search with server data prefetch (5-minute cache) - 03-06
- Dynamic result allocation: best-matching entity type gets 60%, second 30%, third 10% - 03-06
- Search threshold 0.3 for balanced precision/recall in Fuse.js - 03-06
- Weighted search fields: primary identifiers weight 2, secondary fields weight 1.5 - 03-06
- Empty state completely replaces table when no results (not shown inside table body) - 03-07
- Fixed 600px container height for consistent virtualization performance - 03-07
- UserTable scroll resets on query, status, tier, or page changes for predictable UX - 03-07
- j/k navigation initializes to first row when focusedIndex is -1 for better UX - 03-08
- Ref merging uses callback ref pattern to support both virtualization and keyboard - 03-08
- Focus ring uses ring-2 ring-inset ring-platform-primary for brand consistency - 03-08
- Selection background uses bg-platform-primary/10 (10% opacity) for subtle highlight - 03-08
- Search results displayed as flat list sorted by relevance (not grouped by type) - 03-09
- Search results appear after 2+ characters for meaningful queries - 03-09
- Visual separator between search results and navigation in command palette - 03-09
- Entity type labels on right side of results provide type identification - 03-09
- Cheat sheet opens on ? (Shift+/) following developer tool conventions - 03-10
- Shortcuts grouped by category (General, Navigation, Actions, Table) for discoverability - 03-10
- OS-aware modifier display shows Cmd on Mac, Ctrl on Windows/Linux - 03-10
- ShortcutProvider wraps layout to provide keyboard context to all components - 03-10
- Flex layout with explicit widths for virtualized table rows instead of nested tables - 03-11
- Added text-gray-900 to cmdk Input for visible text - 03-11
- Virtualized rows use flex layout with absolute positioning, not nested table elements - 03-11
- Column widths explicitly defined (300, 120, 150, 150, 100) for alignment - 03-11
- Uppy 5.x for file upload orchestration with S3 multipart support - 04-02
- WaveSurfer.js 7.x for audio waveform visualization - 04-02
- web-audio-beat-detector for client-side BPM detection - 04-02
- react-dropzone 14.x for drag-drop file zones - 04-02
- react-tag-autocomplete for tag input with suggestions - 04-02
- Mock S3 URLs with AWS signature format for Uppy compatibility - 04-04
- File type validation based on asset type (music, sfx, motion-graphics, lut, stock-footage) - 04-04
- Multipart sign-part uses 30ms latency (called frequently), other endpoints 50-100ms - 04-04
- Duplicate detection simulated via hash suffix pattern (ending in 0000) - 04-04
- SHA-256 hash format validation (64-character hex string) - 04-04
- Mock asset API generates 500 assets via ID-based seeding for reproducible data - 04-03
- Workflow state transitions validated using lib/workflow/transitions for state machine enforcement - 04-03
- Platform assignment required for music assets in platform_assignment workflow state - 04-03
- Rejection endpoint requires non-empty comments parameter for reviewer feedback - 04-03
- Unpublish endpoint only works on published assets, moves back to draft state - 04-03
- Asset list page follows Phase 2 user table patterns for consistency - 04-07
- Search requires button click in asset filters (not auto-search on keystroke) - 04-07
- Status filter displays user-friendly labels but uses workflow state values - 04-07
- Asset table uses 72px row height for virtualization (same as users table) - 04-07
- Assets navigation link uses music note icon in Sidebar - 04-07
- CSV export filename format for assets: assets-export-{timestamp}.csv - 04-07
- Unpublish action navigates to detail page (action performed there) - 04-07
- Web Crypto API for client-side SHA-256 file hashing (native, no bundle impact) - 04-05
- HTML5 media elements for duration/resolution extraction (no server round-trip) - 04-05
- AudioContext always closed in finally block to prevent memory leaks - 04-05
- detectBPMSafe returns null instead of throwing for optional BPM field - 04-05
- DownloadAssetType renamed from AssetType in user.ts to avoid type conflict - 04-05
- Uppy v5 API requires listParts method for conditional multipart support - 04-06
- File metadata storage via Map enables validation results to flow to asset creation - 04-06
- 100MB threshold for multipart uploads (files < 100MB use single-part presigned URLs) - 04-06
- originalName preserved from File object for accurate asset title generation - 04-06
- Progress bar reserves 5% for finalization step (0-95% during upload) - 04-06
- Platform-primary color theming for active states and progress bars - 04-06
- Cadence Button sm size for compact retry button in upload list - 04-06
- Shared metadata (contributor, genre, tags) applied to all files per CONTEXT decision - 04-08
- Per-file metadata (BPM, duration, resolution) extracted and stored separately - 04-08
- Asset titles derive from original filenames with extension removed - 04-08
- Upload Assets button added to assets list page header for easy access - 04-08
- Asset type selector clears files when changed to prevent type mismatches - 04-08
- 20 mock contributors for development testing - 04-08
- react-tag-autocomplete Tag type properly imported for type safety - 04-08
- Asset detail page follows user detail page pattern for consistency - 04-09
- Discriminated union type narrowing for asset-specific metadata fields - 04-09
- Asset type badges use color-coded scheme (purple/blue/green/yellow/orange) - 04-09
- Platform badges follow Music Vine red, Uppbeat pink, Both gray convention - 04-09
- Workflow status badges use semantic colors (green/red/blue/gray) - 04-09
- WaveSurfer.js @wavesurfer/react hook for waveform rendering with automatic cleanup - 04-10
- Platform-primary CSS variable for waveform progress and player controls - 04-10
- Click on waveform toggles play/pause for improved UX - 04-10
- HTML5 video element with custom controls instead of third-party video player - 04-10
- Type-based preview selection in AssetPreview component - 04-10
- Timeline shows completed stages with green checkmark, current with blue indicator, rejected with red X - 04-11
- Checklist items are stage-specific (initial_review, quality_check, platform_assignment, final_approval, review) - 04-11
- Platform assignment enforced for music assets with radio buttons (music-vine, uppbeat, both) - 04-11
- Comments required for rejection actions, optional for approval - 04-11
- Router refresh after action completion to show updated asset state - 04-11
- Collections API added to middleware public paths for mock development - 04-12
- Collections navigation placed between Assets and Settings in Sidebar - 04-12
- Activity entries sorted newest first (descending) for audit trail relevance - 04-13
- Asset search subtitle includes asset type for quick identification (e.g., "music by Alex Thompson") - 04-13
- Asset search weights: title (2), contributor (1.5), genre (1), tags (1) - 04-13
- Mock activity generation uses asset ID seeding for consistent reproducible data - 04-13
- Client-side filtering determines collection membership until proper API endpoint - 04-12
- Modal UI pattern for add-to-collection action - 04-12
- Add/remove operations use toast notifications for user feedback - 04-12
- WaveSurfer error events trigger user-friendly error UI instead of perpetual loading - 04-15
- Wikimedia Commons public domain audio files used for mock music and SFX URLs - 04-15
- Error state disables play button and replaces waveform with error message - 04-15
- Jotai atomWithStorage with custom serialization for Set<string> bulk selection state - 05-01
- Selection context matching clears state when entity type or filter params change - 05-01
- Range selection accepts full ordered ID array for cross-page Shift+Click support - 05-01
- SelectAll caller responsible for fetching all filtered IDs via API - 05-01
- Server-Sent Events for async bulk operation progress streaming with ReadableStream - 05-02
- SSE event types: ProgressEvent (with time estimate), ErrorEvent, CompleteEvent - 05-02
- Stop on first error pattern for bulk operations (no retry, no partial success) - 05-02
- Seeded random number generation for consistent mock IDs based on filter params - 05-02
- Bulk asset actions: approve, reject, delete, archive, takedown, tag/collection/platform changes - 05-02
- Bulk user actions: suspend, unsuspend, delete - 05-02
- Toast ID ref pattern for updating same toast during SSE progress stream - 05-03
- Time estimate formatting with seconds/minutes threshold at 60s - 05-03
- BulkActionBar returns null when selectedCount === 0 for automatic hide - 05-03
- Action buttons organized by entity type with conditional rendering - 05-03
- Bold variant for primary actions, subtle for secondary, error for destructive - 05-03
- Type-to-confirm pattern for destructive bulk actions (delete, archive, takedown) - 05-04
- Simple confirmation dialogs for safe bulk actions with optional children - 05-04
- AssetListClient wrapper component handles bulk operations state management - 05-05
- Checkbox column positioned first with 48px width for consistent layout - 05-05
- Header checkbox fetches all filtered IDs via /bulk/ids endpoint for Select All - 05-05
- Shift+Click range selection fetches all filtered IDs for cross-page support - 05-05
- createColumns factory function pattern enables hook access in column definitions - 05-05
- Bulk selection integrated alongside keyboard navigation without conflicts - 05-05
- UserListClient wrapper component follows AssetListClient pattern for consistency - 05-06
- UserTable checkbox column positioned first with same 48px width as AssetTable - 05-06
- User bulk operations: suspend (simple confirm), unsuspend (simple confirm), delete (type-to-confirm) - 05-06
- Cached allFilteredIds cleared on filter change to avoid stale cross-page selection - 05-06
- Indeterminate checkbox state for partial selection with header checkbox - 05-06
- Selected rows show bg-platform-primary/10 background for visual feedback - 05-06
- Single audit log entry per bulk operation with operation ID, affected IDs, and status - 05-07
- Failed bulk operations log only IDs processed before error for partial success tracking - 05-07
- Bulk audit entries stored in-memory with console logging until database integration - 05-07
- useBulkProgress accepts flexible body parameters (assetIds/userIds/ids) for entity-specific APIs - 05-08
- Client-server parameter contract: clients send entity-specific IDs matching API expectations - 05-08
- Integer percentages (0-100) for contributor-payee rates to avoid floating-point arithmetic errors - 06-01
- ContributorPayee junction type models many-to-many with percentageRate metadata per relationship - 06-01
- Zod .int() enforces whole-number percentages, .refine() validates sum-to-100% constraint - 06-01
- calculateRemainingPercentage() returns Math.max(0, 100 - sum) for UI remaining allocation display - 06-01
- Pre-defined RATE_CONFIGS arrays guarantee 100% sum by construction, no runtime float arithmetic - 06-02
- Financial export uses decimal rates (0.00-1.00) for accounting; all API routes use integer rates (0-100) - 06-02
- Deterministic seeded mock data uses integer arithmetic (BASE_EPOCH + seed * multiplier), no Math.random - 06-02
- POST /api/contributors/[id]/payees returns human-readable error message with remaining/excess percentage - 06-02
- Contributor status: 18 active (contrib-001 to contrib-018), 1 pending (contrib-019), 1 inactive (contrib-020) - 06-02
- Payee payment methods distributed: 4 ACH, 3 PayPal, 2 wire, 1 check across payee-001 to payee-010 - 06-02
- ContributorTablePagination default page size 20 (matches 20 mock contributors in dev data) - 06-03
- Contributors Sidebar link added between Collections and any future entries - 06-03
- ContributorTable omits bulk selection - contributor bulk operations not planned for Phase 6 - 06-03
- ContributorAssetListItem type defined locally in AssetsTab (API returns simplified shape not matching global AssetListItem) - 06-04
- Tax ID masked to last 4 digits in ProfileTab (SSN-style: ***-**-XXXX format) - 06-04
- PayeesTab action buttons (Edit Rate, Remove, Add Payee) use toast.info() placeholders pointing to Plan 06-06 - 06-04
- Rate summary card wording: 100%=Fully allocated, <100%=X% unassigned, >100%=X% over allocated - 06-04
- PayeeContributorEntry interface defined locally in PayeeContributorsTab - API returns different shape than ContributorListItem - 06-05
- Payment method badges for payees: ACH=blue, Wire=purple, Check=gray, PayPal=indigo (uppercase tracking-wide) - 06-05
- apiClient.get used directly in payee detail page.tsx for contributors fetch (avoids type mismatch with fetchPayeeContributors) - 06-05
- PayeesTab uses local useState synced via useEffect to allow optimistic UI updates after payee mutations - 06-06
- PayeeAssignmentForm shown inline in PayeesTab (not modal) to keep all data visible - 06-06
- Available payees lazy-loaded on first form open and cached for subsequent opens in PayeesTab - 06-06
- Remove payee AlertDialog warns user about needing to re-allocate removed percentage - 06-06
- getSelectedPayeeIds(excludeIndex) pattern for duplicate prevention in useFieldArray multi-row selects - 06-06
- FinancialExportRow defined locally in export-csv.ts to match /api/financials/export decimal rate response - 06-07
- ExportContributorsButton includes both contributor CSV and financial data export side by side - 06-07
- Search type union extended with 'contributor' across SearchResult, SearchableItem, SearchData interfaces - 06-07
- EntityIcons/entityLabels maps in SearchResults.tsx extended with contributor group-of-people icon - 06-07

### Pending Todos

None yet.

### Blockers/Concerns

None. Pre-existing TypeScript errors in asset pages were resolved during Phase 5 verification.

## Session Continuity

Last session: 2026-02-27 UTC
Stopped at: Phase 6 complete — all 8 plans executed and verified
Resume file: None
Phase status: Phase 6 complete, Phase 7 not started
