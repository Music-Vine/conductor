# Architecture Research

**Domain:** React-based Admin Interface / Internal Backoffice Tools
**Researched:** 2026-02-03
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     CLIENT BROWSER LAYER                          │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐  │
│  │  Layout &  │  │   Pages    │  │  Feature   │  │  Shared   │  │
│  │ Navigation │  │  (Routes)  │  │ Components │  │    UI     │  │
│  └──────┬─────┘  └──────┬─────┘  └─────┬──────┘  └─────┬─────┘  │
│         │                │               │               │        │
├─────────┴────────────────┴───────────────┴───────────────┴────────┤
│                     FRONTEND STATE LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  React Query/TanStack (Server State & Cache)             │    │
│  └──────────────────────────────────────────────────────────┘    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Context API  │  │   Zustand    │  │    Form State        │   │
│  │ (Auth/Theme) │  │ (Client UI)  │  │ (React Hook Form)    │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│                    BACKEND-FOR-FRONTEND (BFF)                     │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │         Next.js Server Components / API Routes          │     │
│  │  - Authentication Middleware                            │     │
│  │  - Server Actions (mutations)                           │     │
│  │  - API Proxy Layer                                      │     │
│  │  - Data Transformation                                  │     │
│  └─────────────────────────────────────────────────────────┘     │
├──────────────────────────────────────────────────────────────────┤
│                       EXTERNAL API LAYER                          │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │                  .NET Backend API                        │     │
│  │  - User Management                                      │     │
│  │  - Catalog Management                                   │     │
│  │  - Payee/Contributor Services                           │     │
│  │  - Authentication & Authorization                       │     │
│  └─────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Root Layout** | App shell, navigation, platform context | `app/layout.tsx` with nav, header, sidebar |
| **Route Pages** | Server Components fetching initial data | `app/(dashboard)/users/page.tsx` |
| **Feature Modules** | Self-contained domain logic (users, catalog) | `app/(dashboard)/users/` folder |
| **Shared UI** | Reusable components (shadcn/ui + custom) | `components/ui/` |
| **Auth Middleware** | Session validation, route protection | `middleware.ts` |
| **API Layer** | React Query hooks + fetch abstraction | `lib/api/` |
| **Form Components** | React Hook Form + Zod validation | `components/forms/` |
| **Platform Switcher** | Multi-tenant context provider | `components/platform-switcher.tsx` |
| **Server Actions** | Mutations, form submissions | `app/actions.ts` colocated with routes |

## Recommended Project Structure

```
conductor/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (no layout)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx            # Auth-specific layout
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── users/                # User management feature
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx      # User detail page
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx  # User edit page
│   │   │   ├── page.tsx          # Users list page
│   │   │   ├── loading.tsx       # Loading UI
│   │   │   ├── error.tsx         # Error boundary
│   │   │   └── _components/      # Private components (not routes)
│   │   │       ├── user-table.tsx
│   │   │       └── user-filters.tsx
│   │   ├── catalog/              # Catalog management feature
│   │   │   ├── tracks/
│   │   │   ├── albums/
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   ├── payees/               # Payee/contributor feature
│   │   ├── layout.tsx            # Dashboard layout with nav
│   │   └── page.tsx              # Dashboard home
│   ├── api/                      # API routes (if needed)
│   │   └── [...proxy]/           # Optional proxy route
│   │       └── route.ts
│   ├── actions/                  # Server actions by domain
│   │   ├── users.ts
│   │   ├── catalog.ts
│   │   └── payees.ts
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing/redirect
├── components/                   # Shared components
│   ├── ui/                       # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── table.tsx
│   │   └── dialog.tsx
│   ├── forms/                    # Shared form components
│   │   ├── user-form.tsx
│   │   └── validation-schemas.ts
│   ├── layout/                   # Layout components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── navigation.tsx
│   └── platform-switcher.tsx     # Platform switching UI
├── lib/                          # Core utilities
│   ├── api/                      # API client layer
│   │   ├── client.ts             # Configured fetch/axios
│   │   ├── hooks/                # React Query hooks
│   │   │   ├── use-users.ts
│   │   │   ├── use-catalog.ts
│   │   │   └── use-payees.ts
│   │   ├── queries/              # Query definitions
│   │   └── mutations/            # Mutation definitions
│   ├── auth/                     # Auth utilities
│   │   ├── session.ts
│   │   └── middleware.ts
│   ├── platform/                 # Platform context
│   │   ├── context.tsx
│   │   └── types.ts
│   ├── utils.ts                  # General utilities
│   └── constants.ts              # App constants
├── types/                        # TypeScript types
│   ├── api.ts                    # API response types
│   ├── models.ts                 # Domain models
│   └── index.ts
├── hooks/                        # Shared React hooks
│   ├── use-platform.ts
│   ├── use-session.ts
│   └── use-permissions.ts
├── middleware.ts                 # Next.js middleware (auth)
└── providers.tsx                 # Client providers wrapper
```

### Structure Rationale

- **Route Groups `(auth)` and `(dashboard)`:** Organize routes without affecting URL structure. Different layouts for auth vs. authenticated pages.
- **Feature folders (users, catalog, payees):** Colocation principle - each feature owns its pages, components, and logic. `_components` prefix prevents them from becoming routes.
- **`app/actions/` directory:** Server Actions organized by domain for easy discovery and reuse.
- **`lib/api/` layer:** Centralized API client with React Query hooks, making it easy to switch to mocked APIs during development.
- **Shallow component hierarchy:** Avoid deep nesting. Keep shared components in `components/`, feature-specific in `_components/`.

## Architectural Patterns

### Pattern 1: Backend-for-Frontend (BFF) with Next.js

**What:** Next.js acts as an intermediate layer between React frontend and .NET API. Server Components and API Routes proxy requests, handle auth tokens, and transform data.

**When to use:** When frontend needs to call external APIs (.NET in this case), especially when auth tokens must stay server-side.

**Trade-offs:**
- **Pros:** Security (tokens never reach browser), centralized error handling, data transformation layer
- **Cons:** Additional latency hop, more infrastructure complexity

**Example:**
```typescript
// lib/api/client.ts
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const session = await getSession()
  const platform = getPlatformContext()

  const response = await fetch(`${process.env.API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${session.token}`,
      'X-Platform': platform, // Music Vine vs Uppbeat
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(response.status, await response.text())
  }

  return response.json()
}

// app/(dashboard)/users/page.tsx - Server Component
export default async function UsersPage() {
  // Fetch on server, no client-side API call needed
  const users = await apiClient<User[]>('/api/users')

  return <UsersTable users={users} />
}
```

### Pattern 2: Server-First with Client Islands

**What:** Default to Server Components for data fetching and rendering. Use Client Components only for interactivity (forms, filters, modals).

**When to use:** Always in Next.js App Router. Reduces JavaScript bundle size and improves initial load time.

**Trade-offs:**
- **Pros:** Better performance, SEO (though not critical for admin), simpler data access
- **Cons:** Learning curve, careful client/server boundary management

**Example:**
```typescript
// app/(dashboard)/catalog/tracks/page.tsx - Server Component
import { TrackFilters } from './_components/track-filters'
import { TrackTable } from './_components/track-table'

export default async function TracksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; genre?: string }>
}) {
  const params = await searchParams
  const tracks = await apiClient<Track[]>('/api/tracks', {
    params: { status: params.status, genre: params.genre }
  })

  return (
    <div>
      <TrackFilters /> {/* Client Component - interactive */}
      <TrackTable tracks={tracks} /> {/* Server Component - static */}
    </div>
  )
}

// _components/track-filters.tsx - Client Component
'use client'
export function TrackFilters() {
  const router = useRouter()
  const [status, setStatus] = useState('')

  const handleFilterChange = (newStatus: string) => {
    setStatus(newStatus)
    router.push(`/catalog/tracks?status=${newStatus}`)
  }

  return <Select value={status} onChange={handleFilterChange}>...</Select>
}
```

### Pattern 3: React Query for Client-Side Data Mutations

**What:** Use TanStack Query (React Query) for client-side data fetching, caching, and synchronization. Server Components for initial load, React Query for updates.

**When to use:** Interactive pages where data changes frequently (user editing, live filtering, real-time updates).

**Trade-offs:**
- **Pros:** Automatic refetching, optimistic updates, cache management, less boilerplate
- **Cons:** Additional library, client-side bundle increase, some complexity in SSR hydration

**Example:**
```typescript
// lib/api/hooks/use-users.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetch('/api/users?' + new URLSearchParams(filters)).then(r => r.json()),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (user: User) =>
      fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(user),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// app/(dashboard)/users/_components/user-edit-form.tsx
'use client'
export function UserEditForm({ user }: { user: User }) {
  const { mutate, isPending } = useUpdateUser()

  const handleSubmit = (data: User) => {
    mutate(data, {
      onSuccess: () => toast.success('User updated'),
    })
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### Pattern 4: Multi-Tenant Platform Context

**What:** Context provider that tracks which platform (Music Vine vs Uppbeat) the user is currently working in. All API calls include platform header.

**When to use:** Multi-tenant admin tools where users switch between platforms/organizations.

**Trade-offs:**
- **Pros:** Clean API, automatic platform filtering, easy to test with single platform
- **Cons:** Must be carefully implemented to avoid data leakage between platforms

**Example:**
```typescript
// lib/platform/context.tsx
'use client'
import { createContext, useContext, useState } from 'react'

type Platform = 'music-vine' | 'uppbeat'

const PlatformContext = createContext<{
  platform: Platform
  setPlatform: (platform: Platform) => void
}>({ platform: 'music-vine', setPlatform: () => {} })

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [platform, setPlatform] = useState<Platform>('music-vine')

  return (
    <PlatformContext.Provider value={{ platform, setPlatform }}>
      {children}
    </PlatformContext.Provider>
  )
}

export function usePlatform() {
  return useContext(PlatformContext)
}

// middleware.ts - Server-side platform validation
export function middleware(request: NextRequest) {
  const platform = request.headers.get('x-platform')
  const session = await getSession()

  // Verify user has access to this platform
  if (!session.platforms.includes(platform)) {
    return NextResponse.redirect('/unauthorized')
  }

  return NextResponse.next()
}

// lib/api/client.ts - Automatic platform header
export async function apiClient<T>(endpoint: string) {
  const platform = cookies().get('platform')?.value ?? 'music-vine'

  return fetch(`${API_URL}${endpoint}`, {
    headers: {
      'X-Platform': platform,
    },
  })
}
```

### Pattern 5: Form Handling with Server Actions

**What:** Use React Hook Form for client-side validation and UX, then submit to Server Actions for server-side processing and API calls.

**When to use:** All forms in admin interface. Combines client-side validation with secure server-side processing.

**Trade-offs:**
- **Pros:** Progressive enhancement, secure, automatic revalidation, no API route boilerplate
- **Cons:** Different mental model from traditional REST, testing requires Next.js environment

**Example:**
```typescript
// app/actions/users.ts
'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'viewer']),
})

export async function updateUser(formData: FormData) {
  const session = await getSession()
  if (!session.user.isAdmin) {
    return { error: 'Unauthorized' }
  }

  const data = userSchema.parse({
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
  })

  await apiClient(`/api/users/${formData.get('id')}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  revalidatePath('/users')
  return { success: true }
}

// app/(dashboard)/users/[id]/edit/_components/user-form.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateUser } from '@/app/actions/users'

export function UserForm({ user }: { user: User }) {
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: user,
  })

  const handleSubmit = async (data: User) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value)
    })

    const result = await updateUser(formData)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('User updated')
      router.push('/users')
    }
  }

  return <form onSubmit={form.handleSubmit(handleSubmit)}>...</form>
}
```

### Pattern 6: Route Protection with Middleware

**What:** Next.js middleware validates sessions and permissions before rendering protected routes.

**When to use:** All authenticated routes in admin interface.

**Trade-offs:**
- **Pros:** Centralized auth, runs at edge (fast), prevents unauthorized page access
- **Cons:** Middleware must be lightweight, complex logic should be in Server Components

**Example:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = await getSession(request)

  // Redirect to login if no session
  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check admin routes
  if (request.nextUrl.pathname.startsWith('/admin') && !session.user.isAdmin) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

## Data Flow

### Request Flow (Read)

```
User navigates to /users
    ↓
Next.js Server Component (page.tsx)
    ↓
apiClient (lib/api/client.ts) adds auth + platform headers
    ↓
.NET Backend API (/api/users)
    ↓
Returns JSON response
    ↓
Server Component renders HTML
    ↓
Streams to client (with loading states)
```

### Mutation Flow (Write)

```
User submits form (Client Component)
    ↓
React Hook Form validates (client-side)
    ↓
Calls Server Action (app/actions/users.ts)
    ↓
Server Action validates (server-side, Zod)
    ↓
Checks permissions (session.user.isAdmin)
    ↓
apiClient calls .NET API (PUT /api/users/:id)
    ↓
revalidatePath('/users') clears Next.js cache
    ↓
Returns result to Client Component
    ↓
Client shows toast notification + redirects
```

### State Management Flow

```
┌─────────────────────────────────────────────────────┐
│                  SERVER STATE                        │
│                                                      │
│  React Query Cache                                  │
│  - Users list (queryKey: ['users'])                 │
│  - Catalog items (queryKey: ['catalog', filters])   │
│  - Payees (queryKey: ['payees'])                    │
│                                                      │
│  Automatic background refetch on:                   │
│  - Window focus                                     │
│  - Network reconnect                                │
│  - Manual invalidation after mutations              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                  CLIENT STATE                        │
│                                                      │
│  Context API:                                       │
│  - PlatformContext (Music Vine vs Uppbeat)         │
│  - AuthContext (user session)                      │
│  - ThemeContext (dark/light mode)                  │
│                                                      │
│  Zustand (optional, for complex UI state):         │
│  - Sidebar open/closed                             │
│  - Active filters                                  │
│  - Multi-select state                              │
│                                                      │
│  Component State (useState):                       │
│  - Modal open/closed                               │
│  - Form field values (via React Hook Form)         │
│  - Dropdown open/closed                            │
└─────────────────────────────────────────────────────┘
```

### Key Data Flows

1. **Authentication Flow:** User logs in -> .NET API returns JWT -> Next.js sets httpOnly cookie -> Middleware validates cookie on each request -> Server Components have access to session
2. **Platform Switching Flow:** User clicks platform switcher -> Updates PlatformContext -> Sets cookie -> All subsequent API calls include platform header -> Data filtered by platform
3. **Optimistic Updates Flow:** User edits record -> React Query immediately updates cache (optimistic) -> Calls Server Action -> On success, invalidates query -> On error, rolls back cache

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 24 staff users (current) | Simple architecture is fine. Server Components + React Query. Single Next.js instance. No need for complex caching. |
| 100+ staff users | Add Redis for session storage instead of JWT-only. Consider API response caching with `unstable_cache`. Add monitoring (Sentry, Vercel Analytics). |
| Distributed teams | Add CDN for static assets (automatic with Vercel). Consider edge middleware for auth checks (faster globally). Real-time features might need WebSocket server. |

### Scaling Priorities

1. **First bottleneck: .NET API response time**
   - **Symptom:** Pages load slowly, users complain about lag
   - **Fix:** Add `unstable_cache` in Server Components to cache API responses for 60s. Add loading skeletons to improve perceived performance.
   - **Example:**
   ```typescript
   import { unstable_cache } from 'next/cache'

   const getCachedUsers = unstable_cache(
     async () => apiClient<User[]>('/api/users'),
     ['users-list'],
     { revalidate: 60 }
   )
   ```

2. **Second bottleneck: Complex data transformations**
   - **Symptom:** Server Components take long to render, high CPU usage
   - **Fix:** Move heavy transformations to .NET API. Use React Query to cache transformed data on client. Consider Streaming SSR for large datasets.
   - **Example:**
   ```typescript
   // Instead of transforming in Server Component:
   const tracks = await apiClient<Track[]>('/api/tracks')
   const enriched = tracks.map(track => ({ ...track, albumArt: getAlbumArt(track) }))

   // Ask .NET API to return enriched data:
   const tracks = await apiClient<EnrichedTrack[]>('/api/tracks?includeAlbumArt=true')
   ```

## Anti-Patterns

### Anti-Pattern 1: Using API Routes as Unnecessary Proxy

**What people do:** Create API routes (`app/api/users/route.ts`) that just forward requests to .NET API without any transformation.

**Why it's wrong:** Adds latency and complexity with no benefit. Server Components can call external APIs directly.

**Do this instead:**
```typescript
// DON'T: Create unnecessary API route
// app/api/users/route.ts
export async function GET() {
  const data = await fetch('https://dotnet-api.com/users')
  return Response.json(data)
}

// DO: Call .NET API directly from Server Component
// app/(dashboard)/users/page.tsx
export default async function UsersPage() {
  const users = await apiClient<User[]>('/api/users')
  return <UserTable users={users} />
}
```

**Exception:** Create API routes ONLY when:
- Need CORS for external consumption
- Implementing webhooks
- Need public endpoints (Server Components aren't exposed)

### Anti-Pattern 2: Client-Side Data Fetching for Initial Load

**What people do:** Fetch all data client-side with `useEffect` and React Query, even for initial page load.

**Why it's wrong:** Slow initial load (empty page -> loading spinner -> content), no SEO, waterfall requests.

**Do this instead:**
```typescript
// DON'T: Fetch in Client Component
'use client'
export default function UsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json())
  })

  if (isLoading) return <Spinner />
  return <UserTable users={data} />
}

// DO: Server Component for initial load, React Query for updates
export default async function UsersPage() {
  const initialUsers = await apiClient<User[]>('/api/users')
  return <UserTableClient initialData={initialUsers} />
}

'use client'
function UserTableClient({ initialData }: { initialData: User[] }) {
  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
    initialData, // Hydrate from server
  })

  return <UserTable users={data} />
}
```

### Anti-Pattern 3: Mixing State Management Libraries

**What people do:** Use Redux for some state, Zustand for other state, Context API for more state, and useState everywhere.

**Why it's wrong:** Confusing for team, inconsistent patterns, hard to debug.

**Do this instead:** Follow the "hybrid game" approach (2026 standard):
- **Server state:** React Query (TanStack Query) exclusively
- **Environment state (auth, theme, platform):** Context API
- **Complex UI state:** Zustand (if needed, but probably not for this scale)
- **Component state:** useState

```typescript
// Clear boundaries:
// lib/api/hooks/use-users.ts - Server state
export const useUsers = () => useQuery({ ... })

// lib/platform/context.tsx - Environment state
export const PlatformProvider = ({ children }) => <Context>...</Context>

// components/user-form.tsx - Component state
const [isModalOpen, setIsModalOpen] = useState(false)
```

### Anti-Pattern 4: Over-Abstracting API Calls

**What people do:** Create generic API client with complex abstractions, repositories, service layers, DTOs, mappers—like a backend architecture.

**Why it's wrong:** This is a frontend. Keep it simple. Over-abstraction makes code hard to follow and slows down development.

**Do this instead:**
```typescript
// DON'T: Complex abstraction
class UserRepository {
  constructor(private apiClient: ApiClient) {}

  async findAll(): Promise<UserDTO[]> {
    const response = await this.apiClient.get<UserResponse>('/users')
    return response.data.map(user => this.mapToDTO(user))
  }

  private mapToDTO(user: UserResponse): UserDTO { ... }
}

// DO: Simple, direct API calls
export async function getUsers(): Promise<User[]> {
  return apiClient<User[]>('/api/users')
}

// Or with React Query:
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient<User[]>('/api/users'),
  })
}
```

**Exception:** Abstract ONLY when you have genuine shared logic (auth headers, error handling, platform context). Don't abstract just to "be clean."

### Anti-Pattern 5: Global State for Everything

**What people do:** Put all data in Redux/Zustand, even data that comes from API and rarely changes.

**Why it's wrong:** Server data belongs in React Query cache, not global state. Global state is for UI state that multiple components need.

**Do this instead:**
```typescript
// DON'T: Put API data in Zustand
const useUserStore = create((set) => ({
  users: [],
  fetchUsers: async () => {
    const users = await fetch('/api/users')
    set({ users })
  }
}))

// DO: Use React Query for server data
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient<User[]>('/api/users'),
  })
}

// ONLY use Zustand for UI state that's truly global
const useUIStore = create((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
```

### Anti-Pattern 6: Not Handling Loading and Error States

**What people do:** Show nothing while loading, crash on errors, no retry logic.

**Why it's wrong:** Poor UX, users don't know what's happening, app feels broken.

**Do this instead:**
```typescript
// DON'T: No loading/error handling
export default async function UsersPage() {
  const users = await apiClient<User[]>('/api/users')
  return <UserTable users={users} />
}

// DO: Proper loading and error boundaries
// app/(dashboard)/users/page.tsx
export default async function UsersPage() {
  const users = await apiClient<User[]>('/api/users')
  return <UserTable users={users} />
}

// app/(dashboard)/users/loading.tsx
export default function Loading() {
  return <UserTableSkeleton />
}

// app/(dashboard)/users/error.tsx
'use client'
export default function Error({ error, reset }: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| .NET Backend API | Server Component direct call OR BFF proxy via API Routes | Use Server Components for read-only data. Use Server Actions for mutations. Include auth token and platform header on all requests. |
| Authentication Provider | Middleware + httpOnly cookies | Use NextAuth.js or WorkOS for session management. Validate in middleware. Never store tokens in localStorage. |
| Monitoring (Sentry) | App-level error boundary + Server Action errors | Catch and log errors from both client and server. Include user context and platform in error reports. |
| Analytics (Vercel) | Built-in Next.js integration | Automatic with Vercel deployment. Track page views and Web Vitals. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Server Component ↔ Client Component | Props (serializable only) | Pass promises with React `use` hook for streaming. Never pass functions or class instances. |
| Client Component ↔ Server Action | Direct function call | Import server action, call like normal async function. Return serializable data only. |
| React Query ↔ Server Components | Initial data hydration | Server fetches initial data, pass as `initialData` to React Query. React Query handles refetching. |
| Platform Context ↔ API Client | Context hook + cookies | Client Components use `usePlatform()`. Server Components read from cookies. API client includes platform header. |
| Feature Modules ↔ Shared Components | Import from `@/components` | Feature modules import shared components. Shared components never import from feature modules. |

## Build Order Recommendations

Based on dependencies between components, recommended build order:

### Phase 1: Foundation (No dependencies)
1. **Root Layout** - App shell with basic navigation
2. **Auth Middleware** - Session validation and route protection
3. **Platform Context** - Multi-tenant setup (Music Vine vs Uppbeat)
4. **API Client** - Centralized fetch wrapper with auth + platform headers

### Phase 2: Core Infrastructure (Depends on Phase 1)
5. **Shared UI Components** - Button, Table, Dialog, Form inputs (shadcn/ui setup)
6. **Loading/Error States** - `loading.tsx` and `error.tsx` templates
7. **Dashboard Layout** - Sidebar, header, navigation for authenticated area

### Phase 3: First Feature (User Management)
8. **User List Page** - Server Component fetching users
9. **User Table Component** - Display users with basic filtering
10. **User Detail Page** - View single user
11. **User Form** - React Hook Form + Zod validation
12. **User Server Actions** - Create, update, delete users

### Phase 4: Second Feature (Catalog)
13. **Catalog Structure** - Tracks, albums, playlists routes
14. **Track List** - With React Query for live updates
15. **Approval Workflow Components** - Status badges, action buttons
16. **Catalog Forms** - Track/album editing with file uploads

### Phase 5: Third Feature (Payees)
17. **Payee Management** - Similar pattern to users
18. **Payment History** - Table with filters and exports

**Rationale:**
- **Auth and platform context first** because everything depends on them
- **User management as first feature** because it's simplest (standard CRUD) and establishes patterns for other features
- **Catalog second** because it's more complex (approval workflows, file uploads) and builds on user management patterns
- **Payees last** because it might require integrations with payment systems

## Sources

- [Next.js Architecture in 2026 — Server-First, Client-Islands, and Scalable App Router Patterns](https://www.yogijs.tech/blog/nextjs-project-architecture-app-router)
- [Complete Authentication Guide for Next.js App Router in 2025](https://clerk.com/articles/complete-authentication-guide-for-nextjs-app-router)
- [Building a Secure & Scalable BFF Architecture with Next.js API Routes](https://vishal-vishal-gupta48.medium.com/building-a-secure-scalable-bff-backend-for-frontend-architecture-with-next-js-api-routes-cbc8c101bff0)
- [React-admin - Key Concepts](https://marmelab.com/react-admin/Architecture.html)
- [State Management in 2026: Redux, Context API, and Modern Patterns](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-ui-development)
- [React Stack Patterns](https://www.patterns.dev/react/react-2026/)
- [Multi-Tenancy in React Applications: Complete Implementation Guide](https://clerk.com/articles/multi-tenancy-in-react-applications-guide)
- [Boost Next.js Performance with TanStack Query](https://www.aniq-ui.com/en/blog/boost-nextjs-performance-tanstack-query)
- [Next.js Official Docs: App Router](https://nextjs.org/docs/app/building-your-application/routing)
- [Next.js Official Docs: Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

---
*Architecture research for: Conductor Admin - React-based admin interface for Music Vine and Uppbeat*
*Researched: 2026-02-03*
*Confidence: HIGH - Based on official Next.js documentation, verified community patterns, and established 2026 best practices*
