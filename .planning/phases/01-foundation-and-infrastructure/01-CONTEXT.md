# Phase 1: Foundation & Infrastructure - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish authentication, platform context switching (Music Vine/Uppbeat), API client infrastructure, and shared UI patterns (forms, loading states, error boundaries) that all subsequent features depend on.

</domain>

<decisions>
## Implementation Decisions

### Authentication flow & session handling
- **Passwordless authentication via AWS Cognito**
  - Preferred: Magic link + session tokens (investigate feasibility with Cognito)
  - Fallback: Claude's discretion based on research if magic link isn't viable
- **Session management**
  - 8-hour default session duration
  - Auto-refresh session if user activity detected (extend silently)
  - "Remember me" option extends session to 30 days
  - Session cookies persist across browser sessions (when Remember Me checked)
- **Password recovery** (if using password fallback)
  - Email magic link flow (no temporary passwords)
  - User clicks link, sets new password
- **Login UI**
  - Minimal and fast aesthetic
  - Just email field (for magic link), clean layout
  - No branding distractions, focus on speed

### Platform toggle UX
- **Toggle placement**
  - Located in sidebar/left panel
  - Part of main navigation structure
- **Toggle design**
  - iOS-style segmented control (two buttons, one selected state)
  - Clear visual toggle between Music Vine and Uppbeat
- **Context switching behavior**
  - Preserve current page/context if relevant to new platform
  - Otherwise redirect to platform dashboard
  - Example: Viewing Users on MV → switch to Users on Uppbeat (if exists)
- **Visual platform indicators**
  - Color theme changes based on active platform
  - Entire UI shifts to platform brand colors
  - Makes platform context immediately obvious

### Audit logging scope & visibility
- **Log detail level**
  - Field-level changes captured
  - Format: "Changed email from X to Y"
  - Record before/after values for each modified field
- **Access control**
  - All staff can view all audit logs
  - Complete transparency across team
- **UI visibility**
  - Both global and contextual audit logs
  - Dedicated audit log page (system-wide search/filtering)
  - Contextual history on each resource (user page, asset page, etc.)
- **Logging timing**
  - Claude's discretion (real-time vs batched)
  - Choose based on performance requirements and accuracy needs

### Form validation & error patterns
- **Validation timing**
  - Fire on blur (when user leaves field)
  - Immediate feedback without being aggressive
- **Error message placement**
  - Inline below each invalid field
  - Clear association between error and field
- **Error visual treatment**
  - Red border + error icon on invalid fields
  - Strong visual indicator of validation state
- **Success feedback**
  - Show green checkmark on valid fields
  - Positive reinforcement as user progresses through form

### Claude's Discretion
- Auth implementation details if magic link + Cognito not feasible (research-based decision)
- Audit log timing strategy (real-time vs batched)
- Loading skeleton designs
- Error boundary implementations
- Exact spacing, typography, and micro-interactions

</decisions>

<specifics>
## Specific Ideas

- **Authentication**: AWS Cognito as backend identity provider (existing infrastructure)
- **Platform context**: Music Vine vs Uppbeat toggle is central to entire admin experience
- **Color theming**: Platform brand colors should be distinct enough to make context switching obvious at a glance

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-and-infrastructure*
*Context gathered: 2026-02-03*
