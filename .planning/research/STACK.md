# Technology Stack Research

**Project:** Conductor Admin - Internal Admin Tools & Backoffice Systems
**Domain:** React-based admin interface for managing users, catalog assets, and workflows
**Researched:** 2026-02-03
**Confidence:** HIGH

## Executive Summary

Based on comprehensive research of the 2025-2026 React admin ecosystem, this document provides technology recommendations that complement your locked-in frontend stack (Next.js 16, React 19, TypeScript, Tailwind 4, shadcn/ui, React Query, React Hook Form, Zod). The recommendations focus on: API integration patterns for .NET backends, admin-specific UI libraries, state management beyond React Query, testing strategies, and development tooling.

**Key Finding:** The modern React admin stack has converged on a "composable" approach - using headless libraries (TanStack Table, React Hook Form) with design system components (shadcn/ui) rather than monolithic frameworks, which aligns perfectly with your chosen stack.

---

## Locked-In Core Stack (Already Decided)

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Next.js | 16 | Framework | LOCKED |
| React | 19 | UI Library | LOCKED |
| TypeScript | Latest | Type Safety | LOCKED |
| Tailwind CSS | 4 | Styling | LOCKED |
| shadcn/ui | Latest | Component Library | LOCKED |
| React Query (TanStack Query) | Latest | Server State | LOCKED |
| React Hook Form | Latest | Form Management | LOCKED |
| Zod | Latest | Schema Validation | LOCKED |
| @music-vine/cadence | - | Design System | LOCKED |

---

## Recommended Complementary Stack

### Data Tables & Complex Lists

| Library | Version | Purpose | Why Recommended | Confidence |
|---------|---------|---------|-----------------|------------|
| TanStack Table | 8.21.3+ | Headless table logic | Industry standard for React data tables. Headless design means you control the UI with shadcn/ui components. Handles sorting, filtering, pagination, grouping, virtualization. Works with React 19 but may have minor issues with React Compiler (being addressed). | HIGH |
| @tanstack/react-virtual | Latest | Virtualization | For rendering large lists (3M+ users). Only renders visible rows, dramatically improves performance. Essential for admin panels with large datasets. | HIGH |
| react-window | 1.8.10+ | Alternative virtualization | Simpler alternative to react-virtual. Less features but easier setup. Use if you don't need TanStack ecosystem integration. | MEDIUM |

**Installation:**
```bash
npm install @tanstack/react-table @tanstack/react-virtual
```

**Pattern:** Build data tables using TanStack Table for logic + shadcn/ui Table components for UI. See [shadcn/ui Data Table docs](https://ui.shadcn.com/docs/components/data-table) for integration patterns.

**React 19 Note:** TanStack Table v8.21.3 is compatible with React 19 runtime but may have rendering issues with React 19 Compiler auto-memoization. Monitor [GitHub issue #5567](https://github.com/TanStack/table/issues/5567) for updates.

### File Upload (Music, SFX, Video, Images)

| Library | Version | Purpose | Why Recommended | Confidence |
|---------|---------|---------|-----------------|------------|
| react-uploady | 1.8.0+ | File upload orchestration | Modern, headless file upload library. Supports chunked uploads (critical for large audio/video files), resumable uploads, drag-and-drop, progress tracking. Integrates well with React Hook Form. | HIGH |
| react-dropzone | 14.3.0+ | Drag-and-drop UI | Used by react-admin's FileInput. Simple, accessible drag-and-drop zones. Good for simple use cases where chunking isn't critical. | HIGH |

**Installation:**
```bash
npm install @rpldy/uploady @rpldy/upload-button @rpldy/chunked-uploady
# OR
npm install react-dropzone
```

**Pattern for Large Files:**
- Use `@rpldy/chunked-uploady` to split files into chunks
- Upload chunks sequentially to .NET API
- Store temporary chunks, reassemble on server
- Support pause/resume via chunk tracking

**When to Use Each:**
- **react-uploady**: Large files (>100MB), need resumable uploads, complex workflows
- **react-dropzone**: Simple file uploads, small-medium files (<100MB), basic drag-and-drop

### State Management (Beyond React Query)

| Library | Version | Purpose | Why Recommended | Confidence |
|---------|---------|---------|-----------------|------------|
| Zustand | 5.0.0+ | Global client state | Use for UI state that doesn't belong in React Query (theme, sidebar state, multi-step wizard progress, bulk selection state). Simpler than Redux, works perfectly with React 19. No boilerplate, TypeScript-first. | HIGH |
| Jotai | 2.10.0+ | Atomic state | Alternative to Zustand. Better for complex state interdependencies. More granular re-renders. Steeper learning curve. Choose if you have deeply interconnected UI state. | MEDIUM |

**Installation:**
```bash
npm install zustand
```

**Pattern:**
- **React Query**: All server state (users, assets, API data)
- **Zustand**: UI state (sidebar collapsed, selected rows, filters, wizard step)
- **React Hook Form**: Form state (scoped to form components)

**When NOT to use:** Don't store server data in Zustand/Jotai - that's React Query's job. Only use for pure client-side UI state.

**2025 Consensus:** Zustand is the "sweet spot" for most teams - powerful enough for complex apps, simple enough for quick adoption. Jotai is better for apps with atomic, composable state relationships.

### Authentication & Authorization

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| jose | 5.9.0+ | JWT verification | Edge-compatible JWT library (works in Next.js middleware/proxy.ts). Fast, secure, modern. Use for verifying JWT tokens from .NET API. | HIGH |
| Next.js Middleware (proxy.ts) | Built-in | Route protection | Next.js 16 renames middleware to proxy.ts. Use for lightweight token checks, redirects. Don't do heavy auth logic here - move to Server Components/Actions. | HIGH |

**Installation:**
```bash
npm install jose
```

**Pattern (JWT with .NET Backend):**
1. User logs in via .NET API → receives JWT in httpOnly cookie
2. Next.js proxy.ts checks for cookie presence on protected routes
3. Use `jose` to verify JWT signature in Server Components (not in proxy.ts - too heavy)
4. Store user claims (role, permissions) in JWT payload
5. Check permissions in Server Actions before mutations

**What Changed in Next.js 16:**
- `middleware.ts` → `proxy.ts` (naming reflects intent: lightweight routing/checks)
- Keep proxy.ts fast - only check if cookie exists, redirect if missing
- Do detailed JWT verification in Server Components where you can cache results
- See [Next.js 16 auth patterns](https://medium.com/@reactjsbd/next-js-16-whats-new-for-authentication-and-authorization-1fed6647cfcc)

### API Client & Integration (.NET Backend)

| Approach | Purpose | Why Recommended | Confidence |
|----------|---------|-----------------|------------|
| Native `fetch` | API calls | Next.js 16 extends fetch with caching, deduplication, revalidation. Use in Server Components and Server Actions. Maintains Next.js cache benefits. Zero dependencies. | HIGH |
| React Query + fetch | Client-side API | Already in your stack. Use for client-side data fetching. Provides caching, background refetching, optimistic updates. Pairs perfectly with Server Actions for mutations. | HIGH |

**Pattern:**
```typescript
// Server Component - use fetch with Next.js caching
async function getUsers() {
  const res = await fetch('https://api.example.com/users', {
    next: { revalidate: 60 } // Next.js cache control
  })
  return res.json()
}

// Client Component - use React Query
function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users')
      return res.json()
    }
  })
}

// Mutation - use Server Action + React Query
async function updateUser(id: string, data: UserData) {
  'use server'
  const res = await fetch(`https://api.example.com/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
  revalidateTag('users') // Invalidate Next.js cache
  return res.json()
}
```

**Why NOT Axios:**
- Axios in Server Components opts you out of Next.js caching/deduplication
- Native fetch is extended by Next.js - axios is not
- Only use axios if you need complex interceptors or legacy compatibility

**Integration with .NET API:**
- .NET API returns JWT tokens → store in httpOnly cookies
- Send JWT in `Authorization: Bearer <token>` header for API calls
- Handle .NET validation errors (400) → display with React Hook Form
- Handle .NET auth errors (401) → redirect to login in proxy.ts

### Real-Time Updates (Optional)

| Technology | Purpose | When to Use | Confidence |
|------------|---------|-------------|------------|
| WebSocket (native) | Bidirectional real-time | For collaborative features (multiple admins editing same asset, live approval status updates). Complex to implement correctly. | MEDIUM |
| Server-Sent Events (SSE) | Server→Client streaming | Simpler than WebSockets. Good for notifications, progress updates, live logs. One-way communication. | MEDIUM |
| Polling via React Query | Simple real-time | Simplest approach. React Query refetches on interval. Good enough for most admin use cases (~5-30s updates). | HIGH |

**Recommendation:** Start with React Query polling (`refetchInterval: 30000`). Only add WebSockets if you need sub-second updates or bidirectional communication.

**Pattern (if needed):**
```bash
npm install react-use-websocket
```

Use `useWebSocket` hook from react-use-websocket. Handles reconnection, message queuing, cleanup automatically.

---

## Testing Strategy

### Unit & Component Testing

| Tool | Version | Purpose | Why Recommended | Confidence |
|------|---------|---------|-----------------|------------|
| Vitest | 2.1.0+ | Test runner | Fast, Vite-native, works perfectly with Next.js. Drop-in Jest replacement with better DX. Supports React 19 + concurrent rendering. | HIGH |
| React Testing Library | 16.1.0+ | Component testing | Industry standard for React. Encourages accessible, user-centric tests. Works with Vitest out of the box. | HIGH |
| @vitejs/plugin-react | Latest | Vitest + React integration | Required for testing React components with Vitest | HIGH |

**Installation:**
```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

**Pattern:**
- Test business logic (pure functions, utilities)
- Test custom hooks (form validation, data transforms)
- Test complex components (forms, wizards, approval workflows)
- Don't test shadcn/ui components (already tested)
- Don't test React Query hooks in isolation (integration test instead)

### End-to-End Testing

| Tool | Version | Purpose | Why Recommended | Confidence |
|------|---------|---------|-----------------|------------|
| Playwright | 1.49.0+ | E2E testing | Best-in-class E2E tool. Tests real browser workflows. Auto-waits, great debugging, parallel execution. Industry standard for 2025. | HIGH |

**Installation:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Pattern:**
- Test critical user flows (login → upload asset → submit for approval → approve)
- Test bulk operations (select 100 users → bulk update)
- Test file uploads with real files
- Test error handling (network failures, validation errors)
- Run in CI before deployments

**Testing Pyramid:**
- **70%** Unit/Component tests (Vitest + RTL) - fast feedback
- **20%** Integration tests (Vitest with mocked API)
- **10%** E2E tests (Playwright) - critical flows only

**2025 Consensus:** Vitest + Playwright is the modern stack. Vitest replaces Jest (faster, better DX). Playwright beats Cypress (more reliable, better API). Both work perfectly with React 19.

---

## Development Tools

### Code Quality

| Tool | Purpose | Why Recommended | Confidence |
|------|---------|-----------------|------------|
| ESLint | Linting | Catch bugs, enforce patterns. Use with `eslint-config-next` (built-in). | HIGH |
| Prettier | Formatting | Consistent code style. Use with `prettier-plugin-tailwindcss` for Tailwind class sorting. | HIGH |
| TypeScript | Type checking | Already in stack. Use `strict: true` mode. | HIGH |

**Installation:**
```bash
npm install -D prettier prettier-plugin-tailwindcss
```

**tsconfig.json recommendations:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### API Mocking (Frontend-First Development)

| Tool | Version | Purpose | Why Recommended | Confidence |
|------|---------|---------|-----------------|------------|
| MSW (Mock Service Worker) | 2.6.0+ | API mocking | Mock .NET API in development and tests. Intercepts fetch/XHR at network level. Works in browser and Node. Perfect for frontend-first approach. | HIGH |

**Installation:**
```bash
npm install -D msw
```

**Pattern:**
1. Define .NET API handlers in `src/mocks/handlers.ts`
2. Start MSW in development (`npm run dev` starts MSW automatically)
3. Build features against mocked API
4. Switch to real .NET API when ready
5. Use same mocks in Vitest tests

**Why MSW over alternatives:**
- Works at network level (not tied to fetch/axios)
- Same mocks work in browser and Node (dev + test)
- Doesn't require code changes to switch between mock/real API
- Industry standard for 2025

### Developer Experience

| Tool | Purpose | Why Recommended | Confidence |
|------|---------|-----------------|------------|
| Turbopack | Dev server | Next.js 16 default. Much faster than Webpack. No configuration needed. | HIGH |
| @total-typescript/ts-reset | TypeScript DX | Better TypeScript defaults (stricter types for fetch, JSON, etc.). | MEDIUM |

**Installation:**
```bash
npm install -D @total-typescript/ts-reset
```

Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["@total-typescript/ts-reset"]
  }
}
```

---

## Alternatives Considered

### Data Tables

| Recommended | Alternative | When to Use Alternative | Why Not Default |
|-------------|-------------|------------------------|-----------------|
| TanStack Table | AG Grid | Need Excel-like features (pivoting, advanced filtering, cell editing, charting) out of the box. Willing to pay for Enterprise license. | Commercial license required for advanced features. Heavy bundle size. Opinionated styling harder to customize with Tailwind. |
| TanStack Table | MUI X Data Grid | Already using Material UI elsewhere. Need MUI theming integration. | Requires Material UI (conflicts with shadcn/ui + Tailwind). Heavier than TanStack. |
| TanStack Table | react-admin DataGrid | Building entire admin with react-admin framework | Monolithic framework approach. You've already chosen composable stack. |

### State Management

| Recommended | Alternative | When to Use Alternative | Why Not Default |
|-------------|-------------|------------------------|-----------------|
| Zustand | Redux Toolkit | Large team, need strict conventions, time-travel debugging, extensive middleware. | More boilerplate. Steeper learning curve. Overkill for most admin panels. |
| Zustand | Jotai | Complex atomic state with many interdependencies. Need bottom-up composition. | More abstract. Harder to understand state flow. Better for specific use cases only. |
| Zustand | React Context | Very simple state (1-2 values). Rarely changes. | Re-renders all consumers on change (even with useMemo). Doesn't scale. |

### API Client

| Recommended | Alternative | When to Use Alternative | Why Not Default |
|-------------|-------------|------------------------|-----------------|
| fetch (native) | axios | Need request/response interceptors. Complex retry logic. Older browser support. | Opts out of Next.js caching in Server Components. Adds dependency. fetch is 95% good enough. |
| fetch + React Query | Apollo Client | .NET API is GraphQL (not REST). | Your API is .NET REST/JSON. Apollo is for GraphQL only. |
| fetch + React Query | react-admin dataProvider | Using react-admin framework. | You're not using react-admin framework. React Query is more flexible. |

### Testing

| Recommended | Alternative | When to Use Alternative | Why Not Default |
|-------------|-------------|------------------------|-----------------|
| Vitest | Jest | Existing large Jest test suite. Team expertise with Jest. | Slower than Vitest. Worse DX. Vitest is Jest-compatible API. |
| Playwright | Cypress | Team already expert with Cypress. Need component testing in Cypress. | Playwright is more reliable (better auto-waiting). Better CI support. Faster. |

---

## What NOT to Use

### Avoid: Monolithic Admin Frameworks

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| react-admin | You've already chosen a composable stack (Next.js + shadcn/ui). react-admin is a monolithic framework that wants to own routing, forms, data fetching. Conflicts with Next.js App Router and your locked-in stack. | TanStack Table + React Hook Form + React Query (you already have this) |
| Refine | Similar to react-admin - monolithic framework. Opinionated about routing and data layer. Doesn't align with Next.js 16 patterns. | Continue with your composable approach |
| AdminBro/AdminJS | Node.js-specific admin framework. Doesn't work with .NET API. Generates entire backend + frontend. | Not applicable (you have .NET API) |

**Why composable > framework:** You have specific requirements (Cadence design system, .NET API, 4 legacy systems). A framework would fight your choices. Composing libraries (TanStack, RHF, RQ) gives you flexibility to adapt.

### Avoid: Deprecated/Legacy Libraries

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| React Table v7 | Old version. Not maintained. Replaced by TanStack Table v8. | @tanstack/react-table v8.21.3+ |
| Formik | Maintenance mode. Slower than React Hook Form. Doesn't support React 19 new features. | React Hook Form (already in your stack) |
| Yup | Slower than Zod. Less type-safe. Community moving to Zod. | Zod (already in your stack) |
| Moment.js | Deprecated. Large bundle. Mutable API causes bugs. | date-fns or native Temporal API (coming to browsers) |
| Axios (in Server Components) | Opts out of Next.js fetch extensions (caching, deduplication, revalidation). | Native fetch with Next.js extensions |

### Avoid: Premature Optimization

| Avoid | Why | Do Instead |
|-------|-----|------------|
| WebSockets (initially) | Complex to implement, deploy, scale. Most admin features don't need real-time. | Start with React Query polling. Add WebSockets only if proven necessary. |
| Redis for frontend caching | You have 24 users, not 24M. Next.js built-in caching is sufficient. | Use Next.js `fetch` caching and React Query. Monitor performance. |
| Micro-frontends | Adds massive complexity (CI/CD, versioning, shared state). Only needed at huge scale (100+ developers). | Monorepo with multiple apps if needed. Don't split frontend. |
| GraphQL layer | Adds abstraction over .NET REST API. Unless .NET API is GraphQL, this is unnecessary translation layer. | Call .NET REST API directly with fetch. |

---

## Version Compatibility Matrix

### Verified Compatibilities (HIGH Confidence)

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| @tanstack/react-table | 8.21.3 | React 19 | Works with React 19 runtime. Minor issues with React Compiler (being fixed). |
| @tanstack/react-query | 5.x | React 19 | Full support. Uses React.useSyncExternalStore for concurrent rendering. |
| react-hook-form | 7.54.0+ | React 19 | Full support. Works with React Compiler. |
| zustand | 5.0.0+ | React 19 | Full support. Uses useSyncExternalStore. |
| vitest | 2.1.0+ | React 19 | Full support. Handles concurrent features correctly. |
| @playwright/test | 1.49.0+ | Next.js 16 | Full support. |

### Potential Conflicts to Monitor

| Package A | Package B | Issue | Solution |
|-----------|-----------|-------|----------|
| @tanstack/react-table 8.x | React Compiler | Table may not re-render with Compiler enabled | Disable React Compiler for now OR wait for TanStack update. Monitor [issue #5567](https://github.com/TanStack/table/issues/5567). |
| Next.js 16 `fetch` | axios | axios opts out of Next.js caching | Don't use axios in Server Components. Use native fetch. |

---

## Installation Commands

### Core Admin Libraries
```bash
# Data tables
npm install @tanstack/react-table @tanstack/react-virtual

# State management
npm install zustand

# Authentication
npm install jose

# File uploads (choose one)
npm install @rpldy/uploady @rpldy/upload-button @rpldy/chunked-uploady
# OR
npm install react-dropzone
```

### Development Tools
```bash
# Testing
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
npm install -D @playwright/test
npx playwright install

# Code quality
npm install -D prettier prettier-plugin-tailwindcss

# API mocking
npm install -D msw

# TypeScript improvements
npm install -D @total-typescript/ts-reset
```

---

## Architecture Patterns

### Recommended Folder Structure
```
src/
├── app/                    # Next.js 16 App Router
│   ├── (auth)/            # Auth routes
│   │   └── login/
│   ├── (dashboard)/       # Protected admin routes
│   │   ├── users/
│   │   ├── assets/
│   │   └── approvals/
│   └── api/               # API routes (if needed)
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── data-table/        # Reusable table components
│   ├── forms/             # Form components (with RHF)
│   └── layouts/           # Layout components
├── lib/
│   ├── api/               # API client functions
│   │   ├── users.ts
│   │   ├── assets.ts
│   │   └── client.ts      # Shared fetch wrapper
│   ├── auth/              # Auth utilities
│   │   ├── jwt.ts         # JWT verification (jose)
│   │   └── session.ts
│   ├── hooks/             # Custom hooks
│   ├── stores/            # Zustand stores
│   │   ├── ui-store.ts    # UI state (sidebar, theme)
│   │   └── selection-store.ts
│   ├── utils/             # Utilities
│   └── validations/       # Zod schemas
├── mocks/                 # MSW mocks
│   ├── handlers.ts
│   └── browser.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── proxy.ts               # Next.js 16 middleware (auth checks)
```

### Pattern: Server Actions + React Query
```typescript
// app/actions/users.ts
'use server'
import { revalidateTag } from 'next/cache'

export async function updateUser(id: string, data: UserUpdateSchema) {
  const validated = userUpdateSchema.parse(data) // Zod validation

  const res = await fetch(`${process.env.API_URL}/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validated)
  })

  if (!res.ok) throw new Error('Update failed')

  revalidateTag('users') // Invalidate Next.js cache
  return res.json()
}

// components/user-form.tsx
'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

function UserForm({ user }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data) => updateUser(user.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']) // Invalidate React Query cache
      toast.success('User updated')
    }
  })

  const form = useForm({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: user
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(mutation.mutate)}>
        {/* form fields */}
      </form>
    </Form>
  )
}
```

**Why this pattern:**
- Server Actions provide type-safe, secure mutations
- React Query handles client cache, loading states, errors
- Zod validates on both client and server (DRY)
- Invalidate both Next.js cache (revalidateTag) and React Query cache

### Pattern: Bulk Operations with Optimistic Updates
```typescript
// stores/selection-store.ts
import { create } from 'zustand'

interface SelectionStore {
  selectedIds: Set<string>
  toggleSelection: (id: string) => void
  clearSelection: () => void
  selectAll: (ids: string[]) => void
}

export const useSelectionStore = create<SelectionStore>((set) => ({
  selectedIds: new Set(),
  toggleSelection: (id) => set((state) => {
    const newSet = new Set(state.selectedIds)
    newSet.has(id) ? newSet.delete(id) : newSet.add(id)
    return { selectedIds: newSet }
  }),
  clearSelection: () => set({ selectedIds: new Set() }),
  selectAll: (ids) => set({ selectedIds: new Set(ids) })
}))

// components/users-table.tsx
function UsersTable() {
  const { selectedIds, toggleSelection } = useSelectionStore()
  const queryClient = useQueryClient()

  const bulkUpdate = useMutation({
    mutationFn: async (updates: UserUpdate[]) => {
      return Promise.all(
        updates.map(update => updateUser(update.id, update.data))
      )
    },
    onMutate: async (updates) => {
      // Optimistic update
      await queryClient.cancelQueries(['users'])
      const previousUsers = queryClient.getQueryData(['users'])

      queryClient.setQueryData(['users'], (old) => {
        // Apply optimistic updates
        return applyUpdates(old, updates)
      })

      return { previousUsers }
    },
    onError: (err, updates, context) => {
      // Rollback on error
      queryClient.setQueryData(['users'], context.previousUsers)
    },
    onSettled: () => {
      queryClient.invalidateQueries(['users'])
    }
  })
}
```

---

## Performance Patterns

### Virtualization for Large Lists
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

function UsersList({ users }) {
  const parentRef = useRef(null)

  const virtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Row height
    overscan: 5 // Render 5 extra rows
  })

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <UserRow user={users[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

**When to use:** Lists with 1000+ items. Essential for your 3M+ user dataset.

### Debounced Search with React Query
```typescript
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value'

function UsersSearch() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['users', 'search', debouncedSearch],
    queryFn: () => searchUsers(debouncedSearch),
    enabled: debouncedSearch.length >= 3,
    staleTime: 5 * 60 * 1000 // 5 min
  })

  return (
    <Input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search users..."
    />
  )
}
```

---

## Security Patterns

### JWT Validation in Server Components
```typescript
// lib/auth/session.ts
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return null

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload as SessionPayload
  } catch {
    return null
  }
}

// app/(dashboard)/users/page.tsx
export default async function UsersPage() {
  const session = await getSession()

  if (!session) redirect('/login')
  if (!session.permissions.includes('users:read')) {
    throw new Error('Unauthorized')
  }

  // Fetch users...
}
```

### RBAC Pattern
```typescript
// lib/auth/permissions.ts
export const permissions = {
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  ASSETS_APPROVE: 'assets:approve',
  // ...
} as const

export function hasPermission(
  session: SessionPayload,
  permission: string
): boolean {
  return session.permissions.includes(permission)
}

// components/delete-user-button.tsx
function DeleteUserButton({ userId }) {
  const session = useSession()

  if (!hasPermission(session, permissions.USERS_WRITE)) {
    return null // Hide button
  }

  return <Button onClick={() => deleteUser(userId)}>Delete</Button>
}
```

---

## Sources & References

### High Confidence (Context7, Official Docs)
- [TanStack Table Documentation](https://tanstack.com/table/latest)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [shadcn/ui Data Table Guide](https://ui.shadcn.com/docs/components/data-table)
- [React Hook Form Documentation](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
- [Playwright Documentation](https://playwright.dev)
- [Vitest Documentation](https://vitest.dev)

### Medium Confidence (Verified Web Search, Multiple Sources)
- [5 Best React Data Grid Libraries 2025](https://www.syncfusion.com/blogs/post/top-react-data-grid-libraries-2025)
- [React & Next.js Best Practices 2025](https://strapi.io/blog/react-and-nextjs-in-2025-modern-best-practices)
- [Next.js 16 + React Query Guide](https://medium.com/@bendesai5703/next-js-16-react-query-the-ultimate-guide-to-modern-data-fetching-caching-performance-ac13a62d727d)
- [State Management in 2025: Zustand vs Jotai](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k)
- [Next.js 16 Auth Patterns](https://medium.com/@reactjsbd/next-js-16-whats-new-for-authentication-and-authorization-1fed6647cfcc)
- [Modern Frontend Testing 2025](https://www.defined.net/blog/modern-frontend-testing/)
- [Fetch vs Axios in Next.js](https://rayobyte.com/blog/fetch-vs-axios-in-next-js/)

### Additional References
- [React Admin Bulk Operations](https://marmelab.com/blog/2025/03/24/react-admin-march-2025-update)
- [WebSockets in React 2025](https://velt.dev/blog/websockets-react-guide)
- [TanStack Table React 19 Compatibility Issue](https://github.com/TanStack/table/issues/5567)

---

## Change Log

**2026-02-03:** Initial research for Conductor Admin project
- Researched data table libraries (TanStack Table recommended)
- Researched file upload solutions (react-uploady for large files)
- Researched state management (Zustand over Redux/Jotai)
- Researched testing strategy (Vitest + Playwright)
- Researched .NET API integration patterns (native fetch recommended)
- Verified React 19 compatibility for all recommendations
- Documented Next.js 16 auth patterns (proxy.ts, jose)

---

*Stack recommendations for internal admin tools built with Next.js 16, React 19, and TypeScript. Research conducted 2026-02-03 by GSD Project Researcher.*
