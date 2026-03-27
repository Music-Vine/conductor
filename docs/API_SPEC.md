# Conductor Admin API Specification

> **Version:** 1.0.0-draft
> **Date:** 2026-03-27
> **Target Platform:** .NET 8+ Web API
> **Base Path:** `/admin`

This document defines the REST API contract that the .NET backend must implement to power the Conductor admin interface. All endpoints are currently mocked in the Next.js frontend and proxied through a feature-flagged proxy layer.

---

## Table of Contents

1. [General Conventions](#1-general-conventions)
2. [Authentication & Headers](#2-authentication--headers)
3. [Common Types](#3-common-types)
4. [Users API](#4-users-api)
5. [Assets API](#5-assets-api)
6. [Asset Workflow](#6-asset-workflow)
7. [Asset Upload (S3 Presigned URLs)](#7-asset-upload-s3-presigned-urls)
8. [Bulk Operations](#8-bulk-operations)
9. [Contributors API](#9-contributors-api)
10. [Payees API](#10-payees-api)
11. [Collections API](#11-collections-api)
12. [Activity Feed](#12-activity-feed)
13. [Audit Log](#13-audit-log)
14. [Global Search](#14-global-search)
15. [Financial Export](#15-financial-export)
16. [Workflow State Machines](#16-workflow-state-machines)
17. [Error Codes Reference](#17-error-codes-reference)

---

## 1. General Conventions

### Base URL

```
{BACKEND_API_BASE_URL}/admin
```

The frontend proxy prepends `/admin` to all paths. For example, the frontend route `/api/users` maps to `{BACKEND_API_BASE_URL}/admin/users`.

### Response Envelope

**Paginated list responses** use:

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "totalPages": 10,
    "totalItems": 500
  }
}
```

**Single entity responses** use:

```json
{
  "data": { ... }
}
```

Some endpoints return the entity directly (without wrapping in `data`). See individual endpoint docs for specifics.

**Error responses** use:

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": { }
}
```

### Pagination Parameters

All list endpoints accept these query parameters:

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | integer | `1` | - | 1-based page number |
| `limit` | integer | `50` | `100` | Items per page (clamped to 1-100) |

### Date Format

All dates are **ISO 8601** strings: `2026-03-27T14:30:00.000Z`

### ID Format

IDs are string-typed with domain prefixes:

| Entity | Format | Example |
|--------|--------|---------|
| User | `user-{n}` | `user-42` |
| Asset | `asset-{n}` | `asset-301` |
| Contributor | `contrib-{nnn}` | `contrib-007` |
| Payee | `payee-{nnn}` | `payee-003` |
| Collection | `collection-{n}` | `collection-12` |

The backend may use any ID scheme (GUIDs, integers, etc.) as long as they are returned as strings.

---

## 2. Authentication & Headers

### Request Headers (sent by frontend proxy)

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer {BACKEND_API_SECRET}` — server-to-server auth token |
| `X-Platform` | Yes | Active admin platform context: `music-vine` or `uppbeat` |
| `X-Conductor-User` | Yes | ID of the admin staff member making the request |
| `Content-Type` | Conditional | `application/json` for requests with a body |

### Proxy Behavior

- The frontend proxy forwards all query parameters from the original request
- Timeout: 10 seconds (default), 5 seconds for high-frequency endpoints like `multipart/sign-part`
- On backend error: returns `{ code: "BACKEND_ERROR", message: "Backend returned error" }` with the backend's HTTP status
- On network/timeout error: returns `{ code: "BACKEND_UNAVAILABLE", message: "Backend request failed" }` with HTTP 502

---

## 3. Common Types

### Platform

```typescript
type Platform = "music-vine" | "uppbeat"
```

### Enumerations

```typescript
// User
type UserStatus = "active" | "suspended"
type SubscriptionTier = "free" | "essentials" | "creator" | "pro" | "enterprise"

// Asset
type AssetType = "music" | "sfx" | "motion-graphics" | "lut" | "stock-footage"

// Workflow
type MusicWorkflowState =
  | "draft" | "submitted" | "initial_review" | "quality_check"
  | "platform_assignment" | "final_approval" | "published"
  | "rejected_initial" | "rejected_quality" | "rejected_final"

type SimpleWorkflowState =
  | "draft" | "submitted" | "review" | "published" | "rejected"

type WorkflowActionType =
  | "approve" | "reject" | "request_changes" | "submit"
  | "unpublish" | "fix_metadata" | "assign_platform"

// Financial
type ContributorStatus = "active" | "inactive" | "pending"
type PayeeStatus = "active" | "inactive"
type PaymentMethod = "ach" | "wire" | "check" | "paypal"

// Activity
type ActivityEntityType = "asset" | "user" | "contributor" | "payee"

// User downloads/licenses
type DownloadAssetType = "music" | "sfx" | "motion" | "lut" | "footage"
type LicenseType = "standard" | "premium" | "enterprise"

// Audit
type AuditAction =
  | "user.created" | "user.updated" | "user.deleted"
  | "user.banned" | "user.unbanned"
  | "session.created" | "session.destroyed"
  | "platform.switched"
  | "asset.created" | "asset.updated" | "asset.approved"
  | "asset.rejected" | "asset.deleted"
```

### Address Object

Used by Contributor and Payee entities:

```json
{
  "street": "string",
  "city": "string",
  "state": "string",
  "zip": "string",
  "country": "string"
}
```

---

## 4. Users API

### GET `/admin/users`

List users with filtering and pagination.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search by email, name, username, or ID (case-insensitive) |
| `status` | UserStatus | Filter by account status |
| `tier` | SubscriptionTier | Filter by subscription tier |
| `platform` | Platform | Filter by platform |
| `page` | integer | Page number |
| `limit` | integer | Items per page |

**Response:** `PaginatedResponse<UserListItem>`

```json
{
  "data": [
    {
      "id": "string",
      "email": "string",
      "name": "string | null",
      "username": "string | null",
      "status": "active | suspended",
      "subscriptionTier": "free | essentials | creator | pro | enterprise",
      "platform": "music-vine | uppbeat",
      "lastLoginAt": "ISO 8601 | null",
      "createdAt": "ISO 8601"
    }
  ],
  "pagination": { "page": 1, "pageSize": 50, "totalPages": 2, "totalItems": 100 }
}
```

---

### GET `/admin/users/{id}`

Get detailed user information.

**Response:** `UserDetail` (returned directly, not wrapped in `data`)

```json
{
  "id": "string",
  "email": "string",
  "name": "string | null",
  "username": "string | null",
  "status": "active | suspended",
  "subscriptionTier": "free | essentials | creator | pro | enterprise",
  "platform": "music-vine | uppbeat",
  "lastLoginAt": "ISO 8601 | null",
  "createdAt": "ISO 8601",
  "suspendedAt": "ISO 8601 | null",
  "suspendedReason": "string | null",
  "oauthConnections": [
    {
      "provider": "google",
      "connectedAt": "ISO 8601",
      "email": "string"
    }
  ],
  "subscription": {
    "tier": "free | essentials | creator | pro | enterprise",
    "startedAt": "ISO 8601",
    "expiresAt": "ISO 8601 | null",
    "billingEmail": "string"
  },
  "downloadCount": 0,
  "licenseCount": 0
}
```

**Error:** `404` — User not found

---

### PATCH `/admin/users/{id}`

Partially update user details.

> **Security:** `email` and `status` fields MUST be stripped/ignored. Those require dedicated endpoints with additional verification.

**Request Body:** Partial user fields (excluding `id`, `email`, `status`)

```json
{
  "name": "New Name",
  "username": "newusername"
}
```

**Response:** `{ data: UserDetail }`

**Error:** `400` — Invalid request body, `404` — User not found

---

### POST `/admin/users/{id}/suspend`

Suspend a user account.

**Request Body:** (optional)

```json
{
  "reason": "string"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "string",
    "status": "suspended",
    "suspendedAt": "ISO 8601"
  }
}
```

---

### POST `/admin/users/{id}/unsuspend`

Reinstate a suspended user account.

**Request Body:** (optional)

```json
{}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "string",
    "status": "active",
    "suspendedAt": null
  }
}
```

---

### POST `/admin/users/{id}/refund`

Issue a refund for the user's most recent payment. The backend handles Stripe payment processing.

**Request Body:** (optional)

```json
{}
```

**Response:**

```json
{
  "success": true,
  "message": "Refund initiated",
  "refundId": "string"
}
```

**Errors:**
- `404` — User not found
- `400` — No refundable payments (e.g., free tier user)

**Backend responsibilities:**
1. Retrieve the most recent Stripe payment for this user
2. Issue refund through Stripe API
3. Update subscription status in database
4. Send confirmation email to user
5. Return refund details

---

### POST `/admin/users/{id}/disconnect-oauth`

Disconnect an OAuth provider from a user account.

**Request Body:**

```json
{
  "provider": "google"
}
```

**Response:**

```json
{
  "success": true,
  "message": "google OAuth connection disconnected successfully"
}
```

**Errors:**
- `400` — Invalid provider (must be `"google"`)
- `404` — User not found

---

### GET `/admin/users/{id}/downloads`

Get user's download history with pagination.

**Query Parameters:**

| Parameter | Type | Default |
|-----------|------|---------|
| `page` | integer | `1` |
| `limit` | integer | `20` |

**Response:** `PaginatedResponse<Download>`

```json
{
  "data": [
    {
      "id": "string",
      "assetId": "string",
      "assetName": "string",
      "assetType": "music | sfx | motion | lut | footage",
      "downloadedAt": "ISO 8601",
      "format": "wav | mp3 | aiff | flac"
    }
  ],
  "pagination": { ... }
}
```

Items should be sorted by `downloadedAt` descending (newest first).

---

### GET `/admin/users/{id}/licenses`

Get user's license history with pagination.

**Query Parameters:**

| Parameter | Type | Default |
|-----------|------|---------|
| `page` | integer | `1` |
| `limit` | integer | `20` |

**Response:** `PaginatedResponse<License>`

```json
{
  "data": [
    {
      "id": "string",
      "assetId": "string",
      "assetName": "string",
      "licenseType": "standard | premium | enterprise",
      "grantedAt": "ISO 8601",
      "expiresAt": "ISO 8601 | null"
    }
  ],
  "pagination": { ... }
}
```

Items should be sorted by `grantedAt` descending (newest first). `expiresAt` is `null` for perpetual licenses.

---

### GET `/admin/users/bulk/ids`

Get all user IDs matching current filters (for "Select All" in bulk operations).

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search filter |
| `status` | UserStatus | Status filter |
| `tier` | SubscriptionTier | Tier filter |

**Response:**

```json
{
  "ids": ["user-1", "user-2", ...],
  "total": 150
}
```

---

## 5. Assets API

### GET `/admin/assets`

List assets with filtering and pagination.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search by title, contributor name, or ID |
| `type` | AssetType | Filter by asset type |
| `status` | string | Filter by workflow state |
| `platform` | `music-vine \| uppbeat \| both` | Filter by platform (includes `both` assets when filtering for a specific platform) |
| `genre` | string | Filter by genre (case-insensitive partial match) |
| `page` | integer | Page number |
| `limit` | integer | Items per page |

**Response:** `PaginatedResponse<AssetListItem>`

```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "type": "music | sfx | motion-graphics | lut | stock-footage",
      "contributorName": "string",
      "platform": "music-vine | uppbeat | both",
      "status": "string (MusicWorkflowState | SimpleWorkflowState)",
      "genre": "string | undefined",
      "duration": "number | undefined (seconds)",
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  ],
  "pagination": { ... }
}
```

**Platform filter logic:** When filtering by `music-vine` or `uppbeat`, also include assets where `platform === "both"`.

---

### POST `/admin/assets`

Create a new asset.

**Request Body:**

```json
{
  "type": "music | sfx | motion-graphics | lut | stock-footage",
  "title": "string (required)",
  "contributorId": "string (required)",
  "contributorName": "string",
  "fileKey": "string (required — S3 object key from upload)",
  "platform": "music-vine | uppbeat | both (music only, default: both)",
  "genre": "string",
  "duration": "number (seconds)",
  "description": "string",
  "tags": ["string"]
}
```

**Validation:**
- `type`, `title`, `contributorId`, `fileKey` are required
- Non-music assets are always `platform: "uppbeat"`
- New assets start in `draft` status

**Response:** `201 Created`

```json
{
  "data": { AssetListItem }
}
```

---

### GET `/admin/assets/{id}`

Get full asset detail. Response shape varies by `type` discriminator.

**Response:** `{ data: Asset }` — discriminated union based on `type` field:

#### Base Fields (all types)

```json
{
  "id": "string",
  "title": "string",
  "description": "string | undefined",
  "type": "string (discriminator)",
  "contributorId": "string",
  "contributorName": "string",
  "fileKey": "string",
  "fileUrl": "string",
  "fileSize": "number (bytes)",
  "tags": ["string"],
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601",
  "submittedAt": "ISO 8601 | undefined",
  "approvedAt": "ISO 8601 | undefined",
  "publishedAt": "ISO 8601 | undefined"
}
```

#### type: "music" (additional fields)

```json
{
  "platform": "music-vine | uppbeat | both",
  "status": "MusicWorkflowState",
  "genre": "string",
  "bpm": "number | undefined",
  "key": "string | undefined (e.g., 'C', 'F#', 'Bb')",
  "duration": "number (seconds)",
  "instruments": ["string"] | undefined
}
```

#### type: "sfx" (additional fields)

```json
{
  "platform": "uppbeat",
  "status": "SimpleWorkflowState",
  "category": "string",
  "duration": "number (seconds)"
}
```

#### type: "motion-graphics" (additional fields)

```json
{
  "platform": "uppbeat",
  "status": "SimpleWorkflowState",
  "resolution": "string (e.g., '1920x1080', '3840x2160')",
  "duration": "number (seconds)",
  "format": "string (e.g., 'MOV')"
}
```

#### type: "lut" (additional fields)

```json
{
  "platform": "uppbeat",
  "status": "SimpleWorkflowState",
  "format": "string (e.g., '.cube')",
  "compatibleSoftware": ["string"]
}
```

#### type: "stock-footage" (additional fields)

```json
{
  "platform": "uppbeat",
  "status": "SimpleWorkflowState",
  "resolution": "string",
  "duration": "number (seconds)",
  "frameRate": "number (e.g., 24, 30, 60)"
}
```

**Error:** `404` — Asset not found

---

### PATCH `/admin/assets/{id}`

Update asset metadata.

> **Immutable fields:** `id` and `type` must not be changed.

**Request Body:** Partial asset fields

**Response:** `{ data: Asset }` (updated asset)

**Errors:** `400` — Invalid body, `404` — Asset not found

---

### GET `/admin/assets/{id}/activity`

Get the activity/audit log for a specific asset.

**Response:** `{ data: ActivityEntry[] }`

```json
{
  "data": [
    {
      "id": "string",
      "action": "string (e.g., 'Created asset', 'Updated metadata', 'Changed status')",
      "actorId": "string",
      "actorName": "string",
      "details": "string",
      "createdAt": "ISO 8601"
    }
  ]
}
```

Items should be sorted by `createdAt` descending (newest first).

---

### GET `/admin/assets/bulk/ids`

Get all asset IDs matching current filters (for "Select All" in bulk operations).

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | AssetType | Type filter |
| `status` | string | Status filter |
| `platform` | string | Platform filter |
| `genre` | string | Genre filter |

**Response:**

```json
{
  "ids": ["asset-1", "asset-2", ...],
  "total": 300
}
```

---

## 6. Asset Workflow

### GET `/admin/assets/{id}/workflow`

Get workflow history for an asset.

**Response:** `{ data: WorkflowHistoryItem[] }`

```json
{
  "data": [
    {
      "id": "string",
      "assetId": "string",
      "reviewerId": "string",
      "reviewerName": "string",
      "action": "approve | reject | request_changes | submit | unpublish | fix_metadata | assign_platform",
      "fromState": "string",
      "toState": "string",
      "checklist": [
        { "item": "string", "checked": true }
      ] | undefined,
      "comments": "string | undefined",
      "createdAt": "ISO 8601"
    }
  ]
}
```

Items should be in chronological order (oldest first).

---

### POST `/admin/assets/{id}/approve`

Approve an asset at its current workflow stage.

**Request Body:**

```json
{
  "checklist": [
    { "item": "Audio quality acceptable", "checked": true },
    { "item": "Metadata complete", "checked": true }
  ],
  "comments": "string (optional)",
  "platform": "music-vine | uppbeat | both (REQUIRED when current state is platform_assignment)"
}
```

**Workflow Transitions (see Section 16 for full state machine):**

| Asset Type | From State | To State |
|-----------|------------|----------|
| Music | `submitted` | `initial_review` |
| Music | `initial_review` | `quality_check` |
| Music | `quality_check` | `platform_assignment` |
| Music | `platform_assignment` | `final_approval` (requires `platform` in body) |
| Music | `final_approval` | `published` |
| Simple | `submitted` | `review` |
| Simple | `review` | `published` |

**Response:** `{ data: Asset }` (updated asset with new status)

**Errors:**
- `400` `INVALID_TRANSITION` — Cannot approve in current state
- `400` `PLATFORM_REQUIRED` — Platform selection required for music assets in `platform_assignment` state
- `404` — Asset not found

---

### POST `/admin/assets/{id}/reject`

Reject an asset at its current workflow stage.

**Request Body:**

```json
{
  "checklist": [
    { "item": "Audio quality acceptable", "checked": false }
  ],
  "comments": "string (REQUIRED — must be non-empty)"
}
```

**Workflow Transitions:**

| Asset Type | From State | To State |
|-----------|------------|----------|
| Music | `initial_review` | `rejected_initial` |
| Music | `quality_check` | `rejected_quality` |
| Music | `final_approval` | `rejected_final` |
| Simple | `review` | `rejected` |

**Response:** `{ data: Asset }` (updated asset)

**Errors:**
- `400` `COMMENTS_REQUIRED` — Comments required for rejection
- `400` `INVALID_TRANSITION` — Cannot reject in current state
- `404` — Asset not found

---

### POST `/admin/assets/{id}/unpublish`

Take down a published asset.

**Request Body:** (optional)

```json
{}
```

**Transitions:** `published` -> `draft` (both music and simple workflows)

**Response:** `{ data: Asset }` (asset with `publishedAt` cleared, status set to `draft`)

**Errors:**
- `400` `INVALID_STATE` — Can only unpublish published assets
- `404` — Asset not found

---

## 7. Asset Upload (S3 Presigned URLs)

### Allowed File Types

| Asset Type | Allowed Extensions |
|-----------|-------------------|
| `music` | `.mp3`, `.wav`, `.flac`, `.aiff` |
| `sfx` | `.mp3`, `.wav` |
| `motion-graphics` | `.mp4`, `.mov` |
| `lut` | `.cube`, `.3dl` |
| `stock-footage` | `.mp4`, `.mov` |

### POST `/admin/assets/check-duplicates`

Check if a file hash already exists (pre-upload duplicate detection).

**Request Body:**

```json
{
  "hash": "string (64-char hex SHA-256 hash)",
  "filename": "string"
}
```

**Validation:**
- Both fields required
- Hash must be a 64-character hex string

**Response (no duplicate):**

```json
{
  "isDuplicate": false
}
```

**Response (duplicate found):**

```json
{
  "isDuplicate": true,
  "existingAssetId": "string",
  "existingAssetTitle": "string"
}
```

---

### POST `/admin/assets/presigned-url`

Get a presigned URL for single-part upload (files < 100MB).

**Request Body:**

```json
{
  "filename": "string (required)",
  "contentType": "string (MIME type, required)",
  "size": "number (bytes, required)"
}
```

**Response:**

```json
{
  "url": "string (presigned S3 upload URL)",
  "key": "string (S3 object key, e.g., 'uploads/{uuid}/{filename}')",
  "fields": {}
}
```

**Errors:** `400` — Missing fields or invalid file type

---

### POST `/admin/assets/multipart/create`

Initiate a multipart upload session (files >= 100MB).

**Request Body:**

```json
{
  "filename": "string (required)",
  "contentType": "string (MIME type, required)"
}
```

**Response:**

```json
{
  "uploadId": "string",
  "key": "string (S3 object key)"
}
```

---

### POST `/admin/assets/multipart/sign-part`

Get a presigned URL for uploading a specific part.

**Request Body:**

```json
{
  "key": "string (from create)",
  "uploadId": "string (from create)",
  "partNumber": "number (1-10000)"
}
```

**Response:**

```json
{
  "url": "string (presigned URL for this part)"
}
```

**Errors:** `400` — Missing fields or part number out of range (1-10000)

---

### POST `/admin/assets/multipart/complete`

Complete a multipart upload by assembling all parts.

**Request Body:**

```json
{
  "key": "string",
  "uploadId": "string",
  "parts": [
    { "partNumber": 1, "etag": "string" },
    { "partNumber": 2, "etag": "string" }
  ]
}
```

**Validation:**
- `parts` array must not be empty
- Each part must have `partNumber` (number) and `etag` (string)

**Response:**

```json
{
  "location": "string (final S3 URL of the completed file)"
}
```

---

### POST `/admin/assets/multipart/abort`

Abort a multipart upload, cleaning up any uploaded parts.

**Request Body:**

```json
{
  "key": "string",
  "uploadId": "string"
}
```

**Response:** `200 OK` (empty body)

---

## 8. Bulk Operations

Bulk operations use **Server-Sent Events (SSE)** to stream progress back to the client. The response is `Content-Type: text/event-stream`.

### SSE Event Types

```
data: {"type":"progress","processed":5,"total":100,"percentage":5,"currentItem":"Asset asset-12...","estimatedSecondsRemaining":45}

data: {"type":"error","message":"Failed to approve asset: permission denied","processed":5,"total":100,"failedItem":"asset-13"}

data: {"type":"complete","processed":100,"total":100,"operationId":"bulk-1711555200000-abc123def"}
```

| Event Type | Fields |
|-----------|--------|
| `progress` | `processed`, `total`, `percentage` (0-100), `currentItem` (display name), `estimatedSecondsRemaining` (number \| null) |
| `error` | `message`, `processed` (count before failure), `total`, `failedItem` (ID of failed item) |
| `complete` | `processed`, `total`, `operationId` (for audit reference) |

**Behavior:** Operations stop on first error (no partial continues).

---

### POST `/admin/assets/bulk`

Execute bulk operations on assets.

**Request Body:**

```json
{
  "action": "approve | reject | delete | archive | takedown | add-tag | remove-tag | add-to-collection | remove-from-collection | set-platform",
  "assetIds": ["asset-1", "asset-2"],
  "payload": {
    "tag": "string (for add-tag/remove-tag)",
    "collectionId": "string (for add-to-collection/remove-from-collection)",
    "platform": "music-vine | uppbeat | both (for set-platform)",
    "comments": "string (for reject)"
  }
}
```

**Response:** SSE stream (see event types above)

---

### POST `/admin/users/bulk`

Execute bulk operations on users.

**Request Body:**

```json
{
  "action": "suspend | unsuspend | delete",
  "userIds": ["user-1", "user-2"],
  "payload": {
    "reason": "string (for suspend)"
  }
}
```

**Response:** SSE stream (see event types above)

---

## 9. Contributors API

### GET `/admin/contributors`

List contributors with search, status filtering, and pagination.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search by name, email, or ID |
| `status` | ContributorStatus | Filter by status |
| `page` | integer | Page number |
| `limit` | integer | Items per page |

**Response:** `PaginatedResponse<ContributorListItem>`

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "status": "active | inactive | pending",
      "totalAssets": 0,
      "totalPayees": 0,
      "createdAt": "ISO 8601"
    }
  ],
  "pagination": { ... }
}
```

Results should be sorted by `name` ascending.

---

### POST `/admin/contributors`

Create a new contributor.

**Request Body:**

```json
{
  "name": "string (required)",
  "email": "string (required)",
  "phone": "string",
  "taxId": "string",
  "address": { Address }
}
```

**Response:** `201 Created` — `{ data: ContributorListItem }` (status defaults to `pending`)

**Errors:** `400` — Name and email are required

---

### GET `/admin/contributors/{id}`

Get full contributor detail.

**Response:** `Contributor` (returned directly)

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string | undefined",
  "taxId": "string | undefined (masked, e.g., 'XX-XXX1234')",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zip": "string",
    "country": "string"
  } | undefined,
  "status": "active | inactive | pending",
  "totalAssets": 0,
  "totalPayees": 0,
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

**Error:** `404` — Contributor not found

---

### PATCH `/admin/contributors/{id}`

Partially update contributor details.

**Request Body:** Partial `Contributor` fields (excluding `id`)

**Response:** `{ data: Contributor }`

**Errors:** `400` — Invalid body, `404` — Not found

---

### GET `/admin/contributors/{id}/assets`

Get assets associated with a contributor.

**Response:** `{ data: ContributorAssetListItem[] }`

```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "type": "music | sfx | motion-graphics | lut | stock-footage",
      "status": "string",
      "createdAt": "ISO 8601"
    }
  ]
}
```

---

### GET `/admin/contributors/{id}/payees`

Get payee assignments for a contributor.

**Response:** `{ data: ContributorPayee[] }`

```json
{
  "data": [
    {
      "contributorId": "string",
      "payeeId": "string",
      "payeeName": "string",
      "payeeEmail": "string",
      "paymentMethod": "ach | wire | check | paypal",
      "percentageRate": 70,
      "effectiveDate": "ISO 8601",
      "notes": "string | undefined",
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  ]
}
```

> **Important:** `percentageRate` is an **integer (0-100)** representing the percentage share of royalties.

---

### POST `/admin/contributors/{id}/payees`

Save payee assignments for a contributor.

> **Validation:** The sum of all `percentageRate` values MUST equal exactly `100`.

**Request Body:**

```json
{
  "payees": [
    {
      "payeeId": "string",
      "percentageRate": 70,
      "effectiveDate": "ISO 8601",
      "notes": "string (optional)"
    },
    {
      "payeeId": "string",
      "percentageRate": 30,
      "effectiveDate": "ISO 8601"
    }
  ]
}
```

**Response (success):**

```json
{
  "message": "Payee assignments updated successfully",
  "contributorId": "string",
  "totalPercentage": 100,
  "payeeCount": 2
}
```

**Response (validation error — 400):**

```json
{
  "error": "Percentage rates must sum to exactly 100%",
  "totalPercentage": 85,
  "message": "Total is 85%. Please assign the remaining 15%."
}
```

**Errors:**
- `400` — Payees array required, non-empty
- `400` — Rates don't sum to 100%
- `404` — Contributor not found

---

## 10. Payees API

### GET `/admin/payees`

List payees with filtering and pagination.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search by name, email, or ID |
| `status` | PayeeStatus | Filter by status |
| `paymentMethod` | PaymentMethod | Filter by payment method |
| `page` | integer | Page number |
| `limit` | integer | Items per page |

**Response:** `PaginatedResponse<PayeeListItem>`

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "paymentMethod": "ach | wire | check | paypal",
      "status": "active | inactive",
      "totalContributors": 0,
      "createdAt": "ISO 8601"
    }
  ],
  "pagination": { ... }
}
```

Results should be sorted by `name` ascending.

---

### POST `/admin/payees`

Create a new payee.

**Request Body:**

```json
{
  "name": "string (required)",
  "email": "string (required)",
  "paymentMethod": "ach | wire | check | paypal (required)",
  "phone": "string",
  "taxId": "string",
  "paymentDetails": {
    "accountNumber": "string",
    "routingNumber": "string",
    "paypalEmail": "string"
  },
  "address": { Address }
}
```

**Response:** `201 Created` — `{ data: PayeeListItem }` (status defaults to `active`)

**Errors:** `400` — Name, email, and paymentMethod are required

---

### GET `/admin/payees/{id}`

Get full payee detail.

**Response:** `Payee` (returned directly)

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string | undefined",
  "taxId": "string | undefined (masked)",
  "paymentMethod": "ach | wire | check | paypal",
  "paymentDetails": {
    "accountNumber": "string | undefined (masked, e.g., '****1234')",
    "routingNumber": "string | undefined",
    "paypalEmail": "string | undefined"
  },
  "address": { Address } | undefined,
  "status": "active | inactive",
  "totalContributors": 0,
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

> **Security:** `accountNumber` must be masked (show only last 4 digits). `taxId` must be masked.

---

### PATCH `/admin/payees/{id}`

Partially update payee details.

**Request Body:** Partial `Payee` fields (excluding `id`)

**Response:** `{ data: Payee }`

---

### PUT `/admin/payees/{id}`

Full update of payee details.

**Request Body:** Full `Payee` fields (excluding `id`)

**Response:** `Payee` (returned directly)

---

### GET `/admin/payees/{id}/contributors`

Get contributors associated with a payee (reverse lookup).

**Response:** `{ data: PayeeContributorEntry[] }`

```json
{
  "data": [
    {
      "contributorId": "string",
      "contributorName": "string",
      "contributorEmail": "string",
      "percentageRate": 70,
      "effectiveDate": "ISO 8601"
    }
  ]
}
```

---

## 11. Collections API

### GET `/admin/collections`

List collections with filtering and pagination.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search by title or description |
| `platform` | `music-vine \| uppbeat \| both` | Filter by platform |
| `page` | integer | Page number |
| `limit` | integer | Items per page |

**Response:** `PaginatedResponse<CollectionListItem>`

```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "platform": "music-vine | uppbeat | both",
      "assetCount": 0,
      "createdAt": "ISO 8601"
    }
  ],
  "pagination": { ... }
}
```

---

### POST `/admin/collections`

Create a new collection.

**Request Body:**

```json
{
  "title": "string (required)",
  "description": "string",
  "platform": "music-vine | uppbeat | both (required)",
  "assetIds": ["string"] | []
}
```

**Response:** `201 Created` — `Collection`

```json
{
  "id": "string",
  "title": "string",
  "description": "string | undefined",
  "coverImageUrl": "string | undefined",
  "platform": "music-vine | uppbeat | both",
  "assetIds": ["string"],
  "assetCount": 0,
  "createdBy": "string (staff user ID)",
  "createdByName": "string",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

**Errors:** `400` — Missing required fields (title, platform)

---

### GET `/admin/collections/{id}`

Get collection detail.

**Response:** `Collection` (returned directly, same shape as POST response above)

**Error:** `404` — Collection not found

---

### PATCH `/admin/collections/{id}`

Update collection metadata.

**Request Body:**

```json
{
  "title": "string",
  "description": "string",
  "platform": "music-vine | uppbeat | both"
}
```

**Response:** `Collection`

---

### DELETE `/admin/collections/{id}`

Delete a collection.

**Response:**

```json
{
  "success": true
}
```

**Error:** `404` — Collection not found

---

### POST `/admin/collections/{id}/assets`

Add assets to a collection.

**Request Body:**

```json
{
  "assetIds": ["asset-1", "asset-2"]
}
```

**Behavior:** Appends to existing assets, de-duplicating.

**Response:** `Collection` (updated, with new asset list)

**Errors:** `400` — assetIds must be a non-empty array, `404` — Collection not found

---

### DELETE `/admin/collections/{id}/assets/{assetId}`

Remove an asset from a collection.

**Response:** `Collection` (updated)

**Errors:**
- `404` — Collection not found
- `404` — Asset not found in collection

---

## 12. Activity Feed

### GET `/admin/activity`

System-wide activity feed for all entity changes.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `entityType` | ActivityEntityType | Filter: `asset \| user \| contributor \| payee` |
| `entityId` | string | Filter to a specific entity |
| `page` | integer | Page number |
| `limit` | integer | Items per page (max 200) |

**Response:** `PaginatedResponse<SystemActivityEntry>`

```json
{
  "data": [
    {
      "id": "string",
      "entityType": "asset | user | contributor | payee",
      "entityId": "string",
      "entityName": "string",
      "action": "string (e.g., 'Approved', 'Suspended', 'Rate changed')",
      "actorId": "string (staff user ID)",
      "actorName": "string",
      "details": "string (human-readable detail)",
      "createdAt": "ISO 8601"
    }
  ],
  "pagination": { ... }
}
```

Items should be sorted by `createdAt` descending (newest first).

---

## 13. Audit Log

### POST `/admin/audit`

Record an audit event.

**Request Body:**

```json
{
  "actor": "string (staff user ID)",
  "action": "user.created | user.updated | user.deleted | user.banned | user.unbanned | session.created | session.destroyed | platform.switched | asset.created | asset.updated | asset.approved | asset.rejected | asset.deleted",
  "resource": "string (format: 'type:id', e.g., 'user:123')",
  "timestamp": "number (Unix ms)",
  "platform": "music-vine | uppbeat",
  "metadata": {
    "before": {},
    "after": {},
    "reason": "string",
    "changes": {}
  }
}
```

**Validation:** `actor`, `action`, `resource`, and `platform` are required.

**Response:**

```json
{
  "success": true,
  "id": "string (UUID)"
}
```

---

### GET `/admin/audit`

Query audit events.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `action` | AuditAction | Filter by action type |
| `actor` | string | Filter by actor ID |
| `resource` | string | Filter by resource (partial match) |
| `limit` | integer | Max results (default 50) |

**Response:**

```json
{
  "data": [ AuditEvent, ... ],
  "total": 150
}
```

---

## 14. Global Search

### GET `/admin/search`

Search across all entity types.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query (minimum 2 characters) |

**Response:**

```json
{
  "searchableData": {
    "users": [
      {
        "id": "string",
        "type": "user",
        "title": "string (name or email)",
        "subtitle": "string (email)",
        "searchFields": { "email": "", "name": "", "subscription": "" },
        "url": "/users/{id}"
      }
    ],
    "assets": [
      {
        "id": "string",
        "type": "asset",
        "title": "string",
        "subtitle": "string (e.g., 'music by Alex Thompson')",
        "searchFields": { "title": "", "tags": "", "contributor": "", "genre": "", "assetType": "" },
        "url": "/assets/{id}"
      }
    ],
    "payees": [
      {
        "id": "string",
        "type": "payee",
        "title": "string (name)",
        "subtitle": "string (email)",
        "searchFields": { "name": "", "email": "" },
        "url": "/payees/{id}"
      }
    ],
    "contributors": [
      {
        "id": "string",
        "type": "contributor",
        "title": "string (name)",
        "subtitle": "string (email)",
        "searchFields": { "name": "", "email": "" },
        "url": "/contributors/{id}"
      }
    ]
  },
  "query": "string"
}
```

> **Note:** The frontend performs client-side fuzzy matching on `searchFields`. The backend should return all searchable entities (or a reasonable subset). For large datasets, the backend may perform server-side search and return only matching results.

**Response (empty query or < 2 chars):**

```json
{
  "results": [],
  "query": ""
}
```

---

## 15. Financial Export

### GET `/admin/financials/export`

Export all contributor-payee relationships in flat format for accounting/CSV.

**Response:**

```json
{
  "data": [
    {
      "contributorId": "string",
      "contributorName": "string",
      "contributorEmail": "string",
      "contributorStatus": "active | inactive | pending",
      "payeeId": "string",
      "payeeName": "string",
      "payeeEmail": "string",
      "payeePaymentMethod": "ach | wire | check | paypal",
      "payeeStatus": "active | inactive",
      "percentageRate": 0.70,
      "effectiveDate": "ISO 8601",
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  ],
  "meta": {
    "totalRows": 40,
    "generatedAt": "ISO 8601",
    "percentageFormat": "decimal (0.00-1.00)"
  }
}
```

> **Important:** `percentageRate` is a **decimal (0.00-1.00)** in the export format for accounting compatibility. This differs from the `ContributorPayee` entity where it's an integer (0-100).

---

## 16. Workflow State Machines

### Music Asset Workflow (10 states)

```
                                    ┌──────────────────┐
                                    │      draft       │
                                    └────────┬─────────┘
                                             │ submit
                                    ┌────────▼─────────┐
                              ┌─────│    submitted     │
                              │     └────────┬─────────┘
                              │              │ approve
                              │     ┌────────▼─────────┐
                              │  ┌──│  initial_review  │──┐
                              │  │  └────────┬─────────┘  │
                              │  │           │ approve     │ reject
                              │  │  ┌────────▼─────────┐  │
                              │  │  │  quality_check   │──┼──┐
                              │  │  └────────┬─────────┘  │  │
                              │  │           │ approve     │  │
                              │  │  ┌────────▼───────────┐│  │
                              │  │  │platform_assignment ││  │
                              │  │  └────────┬───────────┘│  │
                              │  │           │ approve     │  │
                              │  │           │ (+platform) │  │
                              │  │  ┌────────▼─────────┐  │  │
                              │  │  │ final_approval   │──┼──┼──┐
                              │  │  └────────┬─────────┘  │  │  │
                              │  │           │ approve     │  │  │
                              │  │  ┌────────▼─────────┐  │  │  │
                              │  │  │    published     │  │  │  │
                              │  │  └────────┬─────────┘  │  │  │
                              │  │           │ unpublish   │  │  │
                              │  │           └──► draft    │  │  │
                              │  │                        │  │  │
                              │  │  ┌─────────────────┐   │  │  │
                              │  │  │rejected_initial │◄──┘  │  │
                              │  │  └────────┬────────┘      │  │
                              │  │           │ submit ──► submitted
                              │  │                           │  │
                              │  │  ┌─────────────────┐      │  │
                              │  │  │rejected_quality │◄─────┘  │
                              │  │  └────────┬────────┘         │
                              │  │           │ submit ──► submitted
                              │  │                              │
                              │  │  ┌─────────────────┐         │
                              │  │  │ rejected_final  │◄────────┘
                              │  │  └────────┬────────┘
                              │  │           │ submit ──► submitted
```

**Additional actions (stay in same state):**
- `fix_metadata`: Available in `draft`, `submitted`, `initial_review`, `quality_check`, `platform_assignment`, `final_approval`
- `request_changes`: Available in `initial_review`, `quality_check`, `final_approval`
- `assign_platform`: Available in `platform_assignment`

### Simple Asset Workflow (5 states)

Used for: SFX, Motion Graphics, LUTs, Stock Footage

```
    ┌──────────┐
    │  draft   │
    └────┬─────┘
         │ submit
    ┌────▼─────┐
    │submitted │
    └────┬─────┘
         │ approve
    ┌────▼─────┐
    │  review  │──── reject ──► rejected ── submit ──► submitted
    └────┬─────┘
         │ approve
    ┌────▼─────┐
    │published │── unpublish ──► draft
    └──────────┘
```

**Additional actions (stay in same state):**
- `fix_metadata`: Available in `draft`, `submitted`, `review`
- `request_changes`: Available in `review`

---

## 17. Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_TRANSITION` | 400 | Workflow action not valid for current state |
| `PLATFORM_REQUIRED` | 400 | Platform selection required (music `platform_assignment` stage) |
| `COMMENTS_REQUIRED` | 400 | Rejection comments required |
| `INVALID_STATE` | 400 | Operation not valid for current entity state |
| `BACKEND_ERROR` | varies | Backend returned a non-2xx response |
| `BACKEND_UNAVAILABLE` | 502 | Backend network/timeout error |

### Standard HTTP Status Codes Used

| Status | Usage |
|--------|-------|
| `200` | Success |
| `201` | Created (POST that creates a new entity) |
| `400` | Validation error or invalid request |
| `404` | Entity not found |
| `500` | Internal server error |
| `502` | Backend unavailable (proxy errors) |

---

## Appendix: Backend Paths Summary

| Frontend Route | Method | Backend Path |
|---------------|--------|--------------|
| `/api/users` | GET | `/admin/users` |
| `/api/users/[id]` | GET, PATCH | `/admin/users/{id}` |
| `/api/users/[id]/suspend` | POST | `/admin/users/{id}/suspend` |
| `/api/users/[id]/unsuspend` | POST | `/admin/users/{id}/unsuspend` |
| `/api/users/[id]/refund` | POST | `/admin/users/{id}/refund` |
| `/api/users/[id]/disconnect-oauth` | POST | `/admin/users/{id}/disconnect-oauth` |
| `/api/users/[id]/downloads` | GET | `/admin/users/{id}/downloads` |
| `/api/users/[id]/licenses` | GET | `/admin/users/{id}/licenses` |
| `/api/users/bulk` | POST | `/admin/users/bulk` |
| `/api/users/bulk/ids` | GET | `/admin/users/bulk/ids` |
| `/api/assets` | GET, POST | `/admin/assets` |
| `/api/assets/[id]` | GET, PATCH | `/admin/assets/{id}` |
| `/api/assets/[id]/workflow` | GET | `/admin/assets/{id}/workflow` |
| `/api/assets/[id]/approve` | POST | `/admin/assets/{id}/approve` |
| `/api/assets/[id]/reject` | POST | `/admin/assets/{id}/reject` |
| `/api/assets/[id]/unpublish` | POST | `/admin/assets/{id}/unpublish` |
| `/api/assets/[id]/activity` | GET | `/admin/assets/{id}/activity` |
| `/api/assets/check-duplicates` | POST | `/admin/assets/check-duplicates` |
| `/api/assets/presigned-url` | POST | `/admin/assets/presigned-url` |
| `/api/assets/multipart/create` | POST | `/admin/assets/multipart/create` |
| `/api/assets/multipart/sign-part` | POST | `/admin/assets/multipart/sign-part` |
| `/api/assets/multipart/complete` | POST | `/admin/assets/multipart/complete` |
| `/api/assets/multipart/abort` | POST | `/admin/assets/multipart/abort` |
| `/api/assets/bulk` | POST | `/admin/assets/bulk` |
| `/api/assets/bulk/ids` | GET | `/admin/assets/bulk/ids` |
| `/api/contributors` | GET, POST | `/admin/contributors` |
| `/api/contributors/[id]` | GET, PATCH | `/admin/contributors/{id}` |
| `/api/contributors/[id]/assets` | GET | `/admin/contributors/{id}/assets` |
| `/api/contributors/[id]/payees` | GET, POST | `/admin/contributors/{id}/payees` |
| `/api/payees` | GET, POST | `/admin/payees` |
| `/api/payees/[id]` | GET, PATCH, PUT | `/admin/payees/{id}` |
| `/api/payees/[id]/contributors` | GET | `/admin/payees/{id}/contributors` |
| `/api/collections` | GET, POST | `/admin/collections` |
| `/api/collections/[id]` | GET, PATCH, DELETE | `/admin/collections/{id}` |
| `/api/collections/[id]/assets` | POST | `/admin/collections/{id}/assets` |
| `/api/collections/[id]/assets/[assetId]` | DELETE | `/admin/collections/{id}/assets/{assetId}` |
| `/api/activity` | GET | `/admin/activity` |
| `/api/audit` | GET, POST | `/admin/audit` |
| `/api/search` | GET | `/admin/search` |
| `/api/financials/export` | GET | `/admin/financials/export` |

**Total: 41 endpoint handlers across 35 routes**
