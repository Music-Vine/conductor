# Phase 1: Foundation & Infrastructure - Research

**Researched:** 2026-02-03
**Domain:** Authentication, Session Management, Platform Context, Audit Logging, Form Validation
**Confidence:** MEDIUM-HIGH

## Summary

Phase 1 establishes the foundational authentication, state management, API infrastructure, and UI patterns that all subsequent features depend on. The research covered AWS Cognito passwordless authentication (magic links), Next.js App Router session management, Jotai state management for platform context, audit logging patterns, and form validation with React Hook Form + Zod + Shadcn UI.

**Key findings:**
- AWS Cognito supports magic link authentication through custom authentication flows (not yet native), requiring three Lambda triggers and using KMS for signing, DynamoDB for one-time use enforcement, and SES for email delivery
- Next.js App Router recommends HttpOnly cookies for session storage with server-side validation, supporting edge runtime session checks from Next.js 15.2+
- Jotai works well with App Router but requires careful provider placement (per-page rather than root layout for proper hydration)
- Audit logging should be event-based, capturing actor, timestamp, action, resource, and before/after state
- React Hook Form + Zod + Shadcn UI is the standard stack with blur-event validation for optimal UX

**Primary recommendation:** Use AWS Cognito with custom auth flow for magic links (fallback to AWS Amplify if complexity is too high), implement session management with HttpOnly cookies validated via Next.js middleware, use Jotai atoms for platform context state, build audit logging as event capture to backend API, and follow Shadcn UI patterns for all forms with blur validation timing.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| AWS Cognito | Current | Identity provider & session management | Existing infrastructure, AWS-native, comprehensive auth features |
| Next.js | 16.1.6 | App Router framework | Project constraint, server/client component architecture |
| React | 19.2.3 | UI library | Project constraint, latest concurrent features |
| Jotai | Latest | Atomic state management | Project constraint, lightweight, React-native state |
| React Query (TanStack Query) | Latest v5 | Server state & API client | Industry standard for data fetching, caching, synchronization |
| React Hook Form | Latest v7 | Form state management | Minimal re-renders, uncontrolled components, excellent performance |
| Zod | Latest v3 | Schema validation | Type-safe, runtime validation, perfect TypeScript integration |
| Shadcn UI | Latest | Component library | Project constraint (via Cadence), accessible, customizable |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @hookform/resolvers | Latest | React Hook Form + Zod bridge | Required for Zod integration with RHF |
| AWS SDK v3 (@aws-sdk/client-cognito-identity-provider) | Latest | Cognito API operations | Server-side admin operations, custom flows |
| AWS Amplify | Latest Gen 2 | High-level AWS integration | Alternative if custom auth flow too complex |
| jose | Latest | JWT signing/verification | Session token handling, lightweight alternative to jsonwebtoken |
| react-loading-skeleton | Latest | Loading UI skeletons | Provides automatic sizing, smooth animations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| AWS Cognito | Auth0, NextAuth.js, Supabase Auth | Third-party dependencies, migration effort from existing Cognito infrastructure |
| React Query | SWR, RTK Query | SWR lacks some advanced features, RTK Query tied to Redux ecosystem |
| Jotai | Zustand, Recoil | Zustand is simpler but less atomic, Recoil has Facebook dependency concerns |
| React Hook Form | Formik | Formik has more re-renders, larger bundle size |

**Installation:**
```bash
# Core dependencies (already in package.json)
npm install next@16.1.6 react@19.2.3 react-dom@19.2.3

# Authentication & API
npm install @tanstack/react-query @aws-sdk/client-cognito-identity-provider jose

# State management (if not already installed)
npm install jotai

# Forms & validation
npm install react-hook-form zod @hookform/resolvers

# UI & Loading states
npm install react-loading-skeleton

# Optional: If using Amplify instead of AWS SDK
npm install aws-amplify @aws-amplify/ui-react
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/                     # Next.js App Router pages
│   ├── (auth)/             # Auth route group (login, magic-link callback)
│   ├── (platform)/         # Platform route group (requires auth + platform context)
│   ├── layout.tsx          # Root layout
│   ├── error.tsx           # Root error boundary
│   └── global-error.tsx    # Global error fallback
├── components/             # React components
│   ├── ui/                 # Shadcn UI components
│   ├── forms/              # Form components (reusable fields)
│   ├── errors/             # Error boundaries
│   └── skeletons/          # Loading skeleton components
├── lib/                    # Core utilities
│   ├── auth/               # Authentication utilities
│   │   ├── cognito.ts      # Cognito client & operations
│   │   ├── session.ts      # Session validation & refresh
│   │   └── magic-link.ts   # Magic link generation/validation
│   ├── api/                # API client layer
│   │   ├── client.ts       # Base API client (fetch wrapper)
│   │   ├── queries/        # React Query query definitions
│   │   └── mutations/      # React Query mutation definitions
│   ├── audit/              # Audit logging
│   │   └── logger.ts       # Audit event capture
│   └── validation/         # Shared Zod schemas
├── providers/              # React context providers
│   ├── QueryProvider.tsx   # React Query provider
│   ├── JotaiProvider.tsx   # Jotai provider (per-page hydration)
│   └── ThemeProvider.tsx   # Theme/platform context provider
├── atoms/                  # Jotai atoms
│   ├── platformAtom.ts     # Music Vine vs Uppbeat context
│   └── sessionAtom.ts      # Session state
├── middleware.ts           # Next.js middleware (auth + session validation)
└── types/                  # TypeScript types
    ├── auth.ts
    ├── audit.ts
    └── api.ts
```

### Pattern 1: Magic Link Authentication with AWS Cognito

**What:** Passwordless authentication using one-time email links with AWS Cognito Custom Authentication Flow

**When to use:** Primary authentication method as specified in phase requirements

**Architecture:**
1. **Frontend Flow:**
   - User enters email → Call custom API endpoint
   - API initiates Cognito custom auth flow → Triggers Lambda
   - Lambda generates signed link → Sends via SES
   - User clicks link → Frontend validates signature → Completes Cognito auth

2. **Lambda Functions (Backend team responsibility, documented for understanding):**
   - `DefineAuthChallenge`: Initiates CUSTOM_CHALLENGE flow
   - `CreateAuthChallenge`: Generates magic link, signs with KMS, stores hash in DynamoDB, sends email via SES
   - `VerifyAuthChallengeResponse`: Validates signature, checks expiry/single-use, completes authentication

3. **Security Measures:**
   - Links signed using KMS asymmetric keys
   - Cryptographic hashes stored in DynamoDB (one-time use)
   - 15-minute expiry window
   - Rate limiting (1 minute between requests)

**Example:**
```typescript
// Source: https://github.com/aws-samples/amazon-cognito-passwordless-auth
// Frontend initiation (simplified)
import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider"

async function requestMagicLink(email: string) {
  const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION })

  const command = new InitiateAuthCommand({
    AuthFlow: "CUSTOM_AUTH",
    ClientId: process.env.COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
    },
  })

  const response = await client.send(command)
  return response.Session // Store for callback
}

// Magic link callback validation
async function validateMagicLink(session: string, signature: string) {
  // VerifyAuthChallengeResponse Lambda handles validation
  const command = new RespondToAuthChallengeCommand({
    ClientId: process.env.COGNITO_CLIENT_ID,
    ChallengeName: "CUSTOM_CHALLENGE",
    Session: session,
    ChallengeResponses: {
      ANSWER: signature,
    },
  })

  const response = await client.send(command)
  return response.AuthenticationResult // Contains tokens
}
```

**Fallback Consideration:**
If custom auth flow proves too complex during implementation, fall back to AWS Amplify with simpler OTP email verification.

### Pattern 2: Session Management with HttpOnly Cookies

**What:** Server-validated session tokens stored in HttpOnly cookies with auto-refresh

**When to use:** All authenticated requests across the application

**Architecture:**
```typescript
// Source: Next.js authentication guide + WorkOS patterns
// lib/auth/session.ts

import { cookies } from 'next/headers'
import { jwtVerify, SignJWT } from 'jose'

interface SessionPayload {
  userId: string
  email: string
  platform: 'music-vine' | 'uppbeat'
  expiresAt: number
}

const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 hours
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function createSession(payload: Omit<SessionPayload, 'expiresAt'>, rememberMe = false) {
  const expiresAt = Date.now() + (rememberMe ? REMEMBER_ME_DURATION : SESSION_DURATION)

  const secret = new TextEncoder().encode(process.env.SESSION_SECRET)
  const session = await new SignJWT({ ...payload, expiresAt })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(new Date(expiresAt))
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(expiresAt),
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')

  if (!sessionCookie?.value) return null

  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET)
    const { payload } = await jwtVerify(sessionCookie.value, secret)
    return payload as SessionPayload
  } catch {
    return null
  }
}

export async function updateSession() {
  const session = await getSession()
  if (!session) return

  // Extend session if user is active
  const expiresAt = Date.now() + SESSION_DURATION
  await createSession(session, false)
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
```

**Middleware integration:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession, updateSession } from '@/lib/auth/session'

export async function middleware(request: NextRequest) {
  const session = await getSession()

  // Redirect to login if no session on protected routes
  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Auto-refresh session if valid
  if (session) {
    await updateSession()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
}
```

### Pattern 3: Platform Context with Jotai

**What:** Atomic state management for Music Vine vs Uppbeat platform switching

**When to use:** Global platform context that persists across navigation but can switch dynamically

**Architecture:**
```typescript
// atoms/platformAtom.ts
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export type Platform = 'music-vine' | 'uppbeat'

// Persist platform choice to localStorage
export const platformAtom = atomWithStorage<Platform>('platform', 'music-vine')

// Derived atoms for platform-specific behavior
export const platformThemeAtom = atom((get) => {
  const platform = get(platformAtom)
  return platform === 'music-vine'
    ? { primary: '#1a1a2e', accent: '#16213e' }
    : { primary: '#0f3460', accent: '#533483' }
})

export const platformApiBaseAtom = atom((get) => {
  const platform = get(platformAtom)
  return platform === 'music-vine'
    ? process.env.NEXT_PUBLIC_MV_API_BASE
    : process.env.NEXT_PUBLIC_UB_API_BASE
})
```

**Provider setup (per-page for proper hydration):**
```typescript
// providers/JotaiProvider.tsx
'use client'

import { Provider } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { platformAtom } from '@/atoms/platformAtom'

export function JotaiProvider({
  children,
  initialPlatform
}: {
  children: React.ReactNode
  initialPlatform?: Platform
}) {
  useHydrateAtoms([[platformAtom, initialPlatform || 'music-vine']])
  return <Provider>{children}</Provider>
}
```

**Platform toggle component:**
```typescript
// components/PlatformToggle.tsx
'use client'

import { useAtom } from 'jotai'
import { platformAtom } from '@/atoms/platformAtom'

export function PlatformToggle() {
  const [platform, setPlatform] = useAtom(platformAtom)

  return (
    <div role="group" aria-label="Platform selector">
      <button
        onClick={() => setPlatform('music-vine')}
        aria-pressed={platform === 'music-vine'}
        className={platform === 'music-vine' ? 'active' : ''}
      >
        Music Vine
      </button>
      <button
        onClick={() => setPlatform('uppbeat')}
        aria-pressed={platform === 'uppbeat'}
        className={platform === 'uppbeat' ? 'active' : ''}
      >
        Uppbeat
      </button>
    </div>
  )
}
```

### Pattern 4: Audit Logging Event Capture

**What:** Frontend event capture for audit trail sent to backend API

**When to use:** All state-changing operations (create, update, delete)

**Architecture:**
```typescript
// lib/audit/logger.ts
interface AuditEvent {
  actor: string // userId from session
  action: string // 'user.updated', 'asset.approved', etc.
  resource: string // 'user:123', 'asset:456'
  timestamp: number
  platform: 'music-vine' | 'uppbeat'
  metadata: {
    before?: Record<string, unknown>
    after?: Record<string, unknown>
    [key: string]: unknown
  }
}

export async function captureAuditEvent(event: Omit<AuditEvent, 'timestamp'>) {
  // Send to backend API (backend stores in database)
  await fetch('/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...event,
      timestamp: Date.now(),
    }),
  })
}

// Usage in mutation
export function useUpdateUser() {
  const mutation = useMutation({
    mutationFn: async ({ userId, before, after }: UpdateUserParams) => {
      const response = await apiClient.put(`/users/${userId}`, after)

      // Capture audit event
      await captureAuditEvent({
        actor: session.userId,
        action: 'user.updated',
        resource: `user:${userId}`,
        platform: currentPlatform,
        metadata: { before, after },
      })

      return response.data
    },
  })

  return mutation
}
```

### Pattern 5: Form Validation with React Hook Form + Zod + Shadcn UI

**What:** Type-safe form validation with blur-event timing and accessible error states

**When to use:** All forms across the application

**Architecture:**
```typescript
// Example: User update form
// Source: https://ui.shadcn.com/docs/forms/react-hook-form

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

// 1. Define Zod schema
const userSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'editor', 'viewer']),
})

type UserFormData = z.infer<typeof userSchema>

export function UserForm({ initialData }: { initialData?: UserFormData }) {
  // 2. Setup form with Zod resolver
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: 'onBlur', // Validate on blur for best UX
    defaultValues: initialData || {
      email: '',
      displayName: '',
      role: 'viewer',
    },
  })

  // 3. Submit handler
  const onSubmit = async (data: UserFormData) => {
    await updateUser(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* 4. Build form with Shadcn UI components */}
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Email</FieldLabel>
            <Input
              {...field}
              type="email"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && (
              <FieldError>{fieldState.error?.message}</FieldError>
            )}
            {!fieldState.invalid && field.value && (
              <span className="text-green-600">✓</span>
            )}
          </Field>
        )}
      />

      <button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

### Pattern 6: Error Boundaries

**What:** Graceful error handling at route segment level

**When to use:** All route segments, with granular boundaries for critical sections

**Architecture:**
```typescript
// app/error.tsx (route segment error boundary)
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error tracking service
    console.error('Route error:', error)
  }, [error])

  return (
    <div className="error-boundary">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}

// app/global-error.tsx (root fallback)
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <h2>Application Error</h2>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  )
}
```

### Pattern 7: Loading Skeletons

**What:** Content placeholders that match actual content structure

**When to use:** All async data loading states

**Architecture:**
```typescript
// components/skeletons/UserListSkeleton.tsx
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export function UserListSkeleton() {
  return (
    <div>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="user-row">
          <Skeleton circle width={40} height={40} />
          <div className="flex-1">
            <Skeleton width="60%" height={20} />
            <Skeleton width="40%" height={16} />
          </div>
          <Skeleton width={80} height={32} />
        </div>
      ))}
    </div>
  )
}

// Usage with Suspense
import { Suspense } from 'react'

export default function UsersPage() {
  return (
    <Suspense fallback={<UserListSkeleton />}>
      <UserList />
    </Suspense>
  )
}
```

### Pattern 8: React Query Setup for API Client

**What:** Unified API client with caching, prefetching, and optimistic updates

**When to use:** All server data fetching

**Architecture:**
```typescript
// providers/QueryProvider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Singleton pattern for QueryClient (critical for Next.js Suspense)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

// lib/api/queries/users.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.get(`/users/${userId}`),
  })
}

// lib/api/mutations/users.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import { captureAuditEvent } from '@/lib/audit/logger'

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, data }: UpdateUserParams) => {
      const before = queryClient.getQueryData(['user', userId])
      const response = await apiClient.put(`/users/${userId}`, data)

      // Audit logging
      await captureAuditEvent({
        actor: session.userId,
        action: 'user.updated',
        resource: `user:${userId}`,
        platform: currentPlatform,
        metadata: { before, after: response.data },
      })

      return response.data
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] })
    },
  })
}
```

### Pattern 9: Platform Theme Switching with CSS Variables

**What:** Dynamic theming based on platform context using Tailwind CSS v4 @theme directive

**When to use:** Platform toggle changes (Music Vine ↔ Uppbeat)

**Architecture:**
```css
/* app/globals.css */
@theme {
  --color-primary: #1a1a2e;
  --color-accent: #16213e;
}

@layer base {
  [data-platform='music-vine'] {
    --color-primary: #1a1a2e;
    --color-accent: #16213e;
  }

  [data-platform='uppbeat'] {
    --color-primary: #0f3460;
    --color-accent: #533483;
  }
}
```

```typescript
// components/ThemeProvider.tsx
'use client'

import { useAtom } from 'jotai'
import { platformAtom } from '@/atoms/platformAtom'
import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [platform] = useAtom(platformAtom)

  useEffect(() => {
    document.documentElement.setAttribute('data-platform', platform)
  }, [platform])

  return <>{children}</>
}
```

### Anti-Patterns to Avoid

- **Premature validation:** Don't validate fields on every keystroke (onChange mode) - use onBlur for better UX
- **Disabled submit buttons:** Don't disable submit button before submission - show validation errors on submit attempt instead
- **Client-only session validation:** Always validate sessions server-side, never trust client-side checks alone
- **Root-level Jotai provider in App Router:** Don't place Provider in root layout - use per-page providers for proper hydration
- **Manual JWT parsing:** Don't hand-roll JWT verification - use established libraries like jose or jsonwebtoken
- **Storing refresh tokens in localStorage:** Never store refresh tokens in localStorage - use HttpOnly cookies only
- **Error boundaries for event handlers:** Don't expect error boundaries to catch errors in onClick handlers - use try/catch instead
- **Global error state:** Don't create global error atoms - error boundaries and React Query error states handle this better

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT signing/verification | Custom crypto implementation | `jose` library | Handles algorithm negotiation, key rotation, timing attacks, edge cases |
| Form state management | useState for every field | React Hook Form | Handles validation, touched state, dirty tracking, submission, errors automatically |
| API caching & refetching | Custom fetch wrapper with cache object | React Query | Handles cache invalidation, background refetching, optimistic updates, request deduplication, retry logic |
| Schema validation | Manual type checking with if statements | Zod | Runtime validation, type inference, composable schemas, error messages |
| Loading skeletons | Hardcoded div placeholders | react-loading-skeleton | Automatically sizes to content, handles animations, theming |
| Session refresh logic | Manual token expiry checking | AWS Cognito refresh tokens + jose | Handles token rotation, secure storage, automatic refresh |
| Audit event formatting | String concatenation for logs | Structured event objects | Queryable, filterable, consistent format, type-safe |
| Error tracking | console.error everywhere | Error boundaries + error service integration | Centralized logging, stack traces, user context, error grouping |
| Platform theme switching | JavaScript style injection | CSS variables + data attributes | Performance (no JS), SSR-compatible, browser-optimized |

**Key insight:** Authentication and session management are security-critical domains with countless edge cases (token refresh race conditions, session fixation attacks, CSRF, timing attacks). Using battle-tested libraries and AWS-managed services reduces security risk significantly compared to custom implementations.

## Common Pitfalls

### Pitfall 1: Magic Link Custom Auth Complexity

**What goes wrong:** Implementing AWS Cognito custom authentication flow for magic links requires coordinating Lambda functions, KMS key management, DynamoDB tables, and SES email configuration - significant DevOps overhead

**Why it happens:** Magic links aren't natively supported by Cognito (as of early 2026), requiring the custom authentication challenge pattern

**How to avoid:**
1. Start with custom auth flow research (AWS sample repo) and backend team coordination
2. Establish clear rollback plan to AWS Amplify + email OTP if complexity exceeds timeline
3. Backend team owns Lambda deployment, frontend only handles initiation + callback

**Warning signs:**
- Backend team unable to deploy Lambda functions within 1 sprint
- Cross-browser magic link validation failing
- Email delivery delays causing UX friction

### Pitfall 2: Jotai Provider Hydration Mismatch

**What goes wrong:** Placing Jotai Provider in root layout.tsx causes hydration errors and state loss during client-side navigation

**Why it happens:** Next.js App Router wraps layout in Suspense boundary; Provider remounts on every Suspense trigger, losing state

**How to avoid:**
```typescript
// ❌ Wrong: Provider in root layout
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <JotaiProvider>{children}</JotaiProvider>
      </body>
    </html>
  )
}

// ✓ Correct: Provider in page.tsx
// app/page.tsx
export default function Page() {
  return (
    <JotaiProvider initialPlatform={serverPlatform}>
      <PageContent />
    </JotaiProvider>
  )
}
```

**Warning signs:**
- Platform context resets on navigation
- "Hydration mismatch" errors in console
- State changes not persisting

### Pitfall 3: Session Refresh Token Rotation Edge Cases

**What goes wrong:** Concurrent requests during token refresh can cause race conditions where old tokens are used after rotation

**Why it happens:** AWS Cognito refresh token rotation (released April 2025) invalidates old tokens immediately; if multiple requests trigger refresh simultaneously, some use stale tokens

**How to avoid:**
- Implement refresh token request queuing (only one refresh in-flight at a time)
- Use React Query's refetchOnMount: false for background requests
- Backend API should return 401 with specific "token rotated" error code

```typescript
// lib/auth/token-refresh.ts
let refreshPromise: Promise<AuthTokens> | null = null

export async function refreshTokens() {
  // Queue multiple simultaneous requests
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const tokens = await cognitoClient.getTokensFromRefreshToken(...)
    return tokens
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}
```

**Warning signs:**
- Intermittent 401 errors on authenticated requests
- "Invalid refresh token" errors in logs
- Users randomly logged out

### Pitfall 4: Blur Validation vs Form Submission Race

**What goes wrong:** User submits form before blur event fires, causing validation to be skipped

**Why it happens:** React Hook Form's onBlur mode only validates after field blur; rapid tab-enter submission bypasses this

**How to avoid:** Combine `mode: 'onBlur'` with `reValidateMode: 'onChange'` for post-error behavior:

```typescript
const form = useForm({
  mode: 'onBlur',        // Initial validation on blur
  reValidateMode: 'onChange', // Re-validate on change after first error
  resolver: zodResolver(schema),
})
```

**Warning signs:**
- Users submitting invalid forms and seeing validation errors on submit
- Error messages appearing late (after submission attempt)

### Pitfall 5: Audit Logging Performance Impact

**What goes wrong:** Synchronous audit logging calls block UI updates, making mutations feel slow

**Why it happens:** Awaiting audit API calls before mutation completes adds network latency to every operation

**How to avoid:** Fire-and-forget audit logging (don't await):

```typescript
// ❌ Wrong: Blocking mutation
const response = await apiClient.put(...)
await captureAuditEvent(...) // Blocks here
return response

// ✓ Correct: Non-blocking
const response = await apiClient.put(...)
captureAuditEvent(...) // Fire and forget (no await)
return response
```

For critical operations where audit log failure should fail the operation, use Promise.all:

```typescript
const [response] = await Promise.all([
  apiClient.put(...),
  captureAuditEvent(...),
])
```

**Warning signs:**
- Mutations feel sluggish (>500ms)
- Network tab shows sequential API calls instead of parallel

### Pitfall 6: Error Boundaries Don't Catch Async Errors

**What goes wrong:** Errors in event handlers, async callbacks, and setTimeout/setInterval aren't caught by error boundaries

**Why it happens:** Error boundaries only catch errors during render phase; async code runs outside this phase

**How to avoid:**

```typescript
// ❌ Wrong: Error boundary won't catch this
function Component() {
  const handleClick = async () => {
    throw new Error("Won't be caught!")
  }

  return <button onClick={handleClick}>Click</button>
}

// ✓ Correct: Manual try/catch
function Component() {
  const [error, setError] = useState(null)

  const handleClick = async () => {
    try {
      await dangerousOperation()
    } catch (err) {
      setError(err)
    }
  }

  if (error) return <ErrorDisplay error={error} />

  return <button onClick={handleClick}>Click</button>
}

// ✓ Better: React Query handles errors automatically
function Component() {
  const mutation = useMutation({
    mutationFn: dangerousOperation,
    onError: (error) => {
      // React Query captures and exposes error
    },
  })

  if (mutation.error) return <ErrorDisplay error={mutation.error} />

  return <button onClick={() => mutation.mutate()}>Click</button>
}
```

**Warning signs:**
- Unhandled promise rejections in console
- Errors not showing in error boundary UI
- Application state becomes inconsistent after errors

### Pitfall 7: CSS Variable Theming FOUC (Flash of Unstyled Content)

**What goes wrong:** Platform theme flashes wrong colors on page load before JavaScript sets data-platform attribute

**Why it happens:** Initial HTML has no data-platform attribute; JavaScript runs client-side after paint

**How to avoid:**
1. Set data-platform server-side in root layout
2. Read platform from cookie/session before render

```typescript
// app/layout.tsx
import { cookies } from 'next/headers'

export default async function RootLayout({ children }) {
  const cookieStore = await cookies()
  const platform = cookieStore.get('platform')?.value || 'music-vine'

  return (
    <html data-platform={platform}>
      <body>{children}</body>
    </html>
  )
}
```

**Warning signs:**
- Colors flash/change after page load
- Theme inconsistent between server/client render

## Code Examples

Verified patterns from official sources:

### React Query with Next.js App Router (Server Prefetch + Client Hydration)

```typescript
// Source: https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
// app/users/[id]/page.tsx (Server Component)

import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { UserDetails } from './UserDetails'

export default async function UserPage({ params }: { params: { id: string } }) {
  const queryClient = new QueryClient()

  // Prefetch on server
  await queryClient.prefetchQuery({
    queryKey: ['user', params.id],
    queryFn: () => fetch(`/api/users/${params.id}`).then(r => r.json()),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserDetails userId={params.id} />
    </HydrationBoundary>
  )
}

// UserDetails.tsx (Client Component)
'use client'

import { useQuery } from '@tanstack/react-query'

export function UserDetails({ userId }: { userId: string }) {
  // Hydrates from prefetched server data
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
  })

  if (isLoading) return <UserSkeleton />

  return <div>{data.name}</div>
}
```

### Shadcn Form with Custom Validation (Cross-field)

```typescript
// Source: https://ui.shadcn.com/docs/forms/react-hook-form
// Example: Password confirmation form

import { z } from 'zod'

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'], // Error shows on confirmPassword field
})

export function PasswordForm() {
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    mode: 'onBlur',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        name="password"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Password</FieldLabel>
            <Input {...field} type="password" />
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />

      <Controller
        name="confirmPassword"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Confirm Password</FieldLabel>
            <Input {...field} type="password" />
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />

      <button type="submit">Create Account</button>
    </form>
  )
}
```

### Next.js Middleware Session Validation (Edge Runtime)

```typescript
// Source: https://nextjs.org/docs/app/guides/authentication
// middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Validate session (works in Edge runtime from Next.js 15.2+)
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET)
    const { payload } = await jwtVerify(sessionCookie.value, secret)

    // Add user context to headers for downstream consumption
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId as string)
    requestHeaders.set('x-platform', payload.platform as string)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (err) {
    // Invalid session
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|magic-link).*)',
  ],
}
```

### Optimistic UI Updates with React Query

```typescript
// Source: React Query docs + best practices
// lib/api/mutations/users.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { User } from '@/types/user'

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string, updates: Partial<User> }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      return response.json()
    },

    // Optimistic update
    onMutate: async ({ userId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user', userId] })

      // Snapshot current value
      const previousUser = queryClient.getQueryData(['user', userId])

      // Optimistically update
      queryClient.setQueryData(['user', userId], (old: User) => ({
        ...old,
        ...updates,
      }))

      // Return context for rollback
      return { previousUser }
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(['user', variables.userId], context.previousUser)
      }
    },

    // Refetch after success
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] })
    },
  })
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| NextAuth.js with pages router | Auth.js with App Router or custom solutions | 2023-2024 | NextAuth.js became Auth.js, better App Router support but still has limitations with middleware |
| JavaScript-based Tailwind config | CSS-based @theme directive (Tailwind v4) | 2024 | Simpler theming, native CSS variables, better performance |
| AWS SDK v2 | AWS SDK v3 (modular) | 2020 (stable 2023) | Smaller bundle sizes, tree-shaking, modern async/await |
| Formik for forms | React Hook Form | 2020-2023 | Better performance, fewer re-renders, smaller bundle |
| Yup for validation | Zod | 2021-2024 | TypeScript-first, better type inference, runtime safety |
| Context API for global state | Jotai/Zustand | 2021-2024 | Atomic state, less boilerplate, better performance |
| Custom fetch wrappers | React Query/SWR | 2020-2024 | Built-in caching, refetching, optimistic updates |
| Manual refresh token handling | AWS Cognito refresh token rotation | April 2025 | Automatic rotation, improved security, simpler implementation |

**Deprecated/outdated:**
- **amazon-cognito-identity-js**: Lower-level library, replaced by AWS Amplify for frontend or AWS SDK v3 for backend
- **NextAuth.js**: Rebranded to Auth.js, but has App Router limitations; custom solutions often preferred for Next.js 15+
- **React Query v3**: v5 is current, v3 lacks server component integration
- **Tailwind v3 config**: v4 uses @theme directive, JavaScript config still works but not recommended
- **JWT stored in localStorage**: Security anti-pattern, use HttpOnly cookies only

## Open Questions

Things that couldn't be fully resolved:

### 1. Cadence Design System Documentation

**What we know:**
- Project constraint specifies using Cadence design system (@music-vine/cadence)
- Shadcn UI is listed as related technology
- No public documentation or npm package found

**What's unclear:**
- Is Cadence a wrapper around Shadcn UI or separate component library?
- Are there Music Vine/Uppbeat-specific components available?
- What's the relationship between Cadence and Shadcn UI?

**Recommendation:**
- Clarify with team: Is Cadence an internal fork of Shadcn UI or separate library?
- If Cadence is private/internal, request access to documentation
- Assume Shadcn UI patterns until Cadence specifics confirmed
- Plan to migrate/adapt once Cadence details available

**Confidence:** LOW (could not verify Cadence existence or structure)

### 2. Backend API Contract Timing

**What we know:**
- Frontend-first approach: mock API calls, generate requirements for backend team
- .NET backend built by separate team
- Phase 1 requires API endpoints for: session management, audit logging, user data

**What's unclear:**
- Timeline for backend team to implement required endpoints
- Mock API strategy (MSW, JSON files, or custom mock server)
- How to coordinate API contract changes during development

**Recommendation:**
- Define API contracts early in planning phase (before tasks begin)
- Use MSW (Mock Service Worker) for API mocking during development
- Document all API requirements with request/response examples
- Establish weekly sync with backend team for contract alignment

**Confidence:** MEDIUM (pattern is clear, timing coordination is unknown)

### 3. AWS Infrastructure Ownership

**What we know:**
- AWS Cognito is existing infrastructure
- Magic links require Lambda functions, KMS keys, DynamoDB tables, SES configuration

**What's unclear:**
- Who deploys and maintains Lambda functions for custom auth flow?
- Does DevOps team handle infrastructure or backend team?
- What's approval process for new AWS resources?

**Recommendation:**
- Identify infrastructure owner before Phase 1 implementation begins
- If complexity too high, fall back to AWS Amplify + email OTP
- Document infrastructure requirements early for approval/provisioning

**Confidence:** MEDIUM (technical approach clear, organizational responsibility unclear)

### 4. Audit Log Storage & Retention

**What we know:**
- Frontend captures audit events (actor, action, resource, before/after)
- All staff can view all audit logs (no access restrictions)
- Field-level tracking required

**What's unclear:**
- Database storage solution (PostgreSQL, DynamoDB, dedicated audit DB)?
- Retention policy (how long to keep logs)?
- Performance considerations for querying large audit datasets

**Recommendation:**
- Backend team decision on storage
- Frontend assumes REST API endpoint: POST /api/audit, GET /api/audit?filters
- Plan for pagination/filtering from start (audit logs grow quickly)

**Confidence:** MEDIUM (frontend concerns clear, backend implementation details unknown)

## Sources

### Primary (HIGH confidence)

**Official Documentation:**
- [AWS Cognito Authentication Flows](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow-methods.html) - Custom authentication patterns
- [AWS Cognito Refresh Token Rotation](https://aws.amazon.com/about-aws/whats-new/2025/04/amazon-cognito-refresh-token-rotation/) - Token rotation feature (April 2025)
- [Next.js Error Handling](https://nextjs.org/docs/app/getting-started/error-handling) - Error boundaries, error.js, global-error.js
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) - Session management patterns
- [Shadcn UI React Hook Form Integration](https://ui.shadcn.com/docs/forms/react-hook-form) - Form patterns
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4) - @theme directive, CSS variables
- [TanStack Query Advanced SSR](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr) - Next.js App Router integration
- [React Hook Form Documentation](https://react-hook-form.com/docs/useform) - API reference
- [Jotai Next.js Guide](https://jotai.org/docs/guides/nextjs) - App Router integration

**AWS Samples:**
- [AWS Cognito Passwordless Auth Sample](https://github.com/aws-samples/amazon-cognito-passwordless-auth) - Magic link implementation reference
- [Magic Links Documentation](https://github.com/aws-samples/amazon-cognito-passwordless-auth/blob/main/MAGIC-LINKS.md) - Detailed implementation guide

### Secondary (MEDIUM confidence)

**Tutorials & Guides:**
- [React Hook Form with Zod Complete Guide for 2026](https://dev.to/marufrahmanlive/react-hook-form-with-zod-complete-guide-for-2026-1em1) - Integration patterns
- [Building Advanced React Forms Using React Hook Form, Zod and Shadcn](https://wasp.sh/blog/2025/01/22/advanced-react-hook-form-zod-shadcn) - Advanced validation patterns
- [Inline Form Validation UX - Smashing Magazine](https://www.smashingmagazine.com/2022/09/inline-validation-web-forms-ux/) - Validation timing best practices
- [React Query as State Manager in Next.js](https://geekyants.com/blog/react-query-as-a-state-manager-in-nextjs-do-you-still-need-redux-or-zustand) - State management patterns
- [Top 5 Authentication Solutions for Next.js Apps in 2026](https://workos.com/blog/top-authentication-solutions-nextjs-2026) - Auth comparison
- [AWS Cognito: Amplify vs amazon-cognito-identity-js vs AWS SDK](https://www.maxivanov.io/aws-cognito-amplify-vs-amazon-cognito-identity-js-vs-aws-sdk/) - Library comparison

**Community Resources:**
- [Form Validation Best Practices](https://ivyforms.com/blog/form-validation-best-practices/) - UX patterns
- [Audit Logs: Comprehensive Guide](https://middleware.io/blog/audit-logs/) - Implementation patterns
- [Guide to Building Audit Logs for Application Software](https://medium.com/@tony.infisical/guide-to-building-audit-logs-for-application-software-b0083bb58604) - Architecture patterns
- [Theme Toggle in ReactJS using CSS Variables and React Context](https://medium.com/@VedantLahane/theme-toggle-in-reactjs-using-css-variables-and-react-context-6a91cf8abcee) - Theming patterns

### Tertiary (LOW confidence - marked for validation)

- Cadence design system (@music-vine/cadence) - No public documentation found, assume Shadcn UI patterns until clarified
- Specific backend API endpoints - Requires coordination with backend team
- AWS infrastructure ownership - Organizational decision needed

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries are industry-standard with official documentation and active maintenance
- Architecture patterns: MEDIUM-HIGH - Patterns verified with official docs, but some organizational details (backend API, infrastructure) require clarification
- Pitfalls: HIGH - Based on official documentation warnings and established community knowledge
- Cadence design system: LOW - No public documentation found

**Research limitations:**
- Cadence design system details unavailable publicly (may be internal/private)
- Backend API contract timing unknown (requires team coordination)
- AWS infrastructure ownership unclear (organizational decision)

**Research date:** 2026-02-03
**Valid until:** ~60 days (stable ecosystem, most libraries mature)

**Note:** AWS Cognito refresh token rotation is recent (April 2025), monitor for updates and community adoption patterns.
