import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import type { SessionPayload } from '@/types'
import { PlatformLayoutClient } from './layout-client'

/**
 * Platform layout for authenticated pages.
 * Server component that validates session and passes user data to client layout.
 */
export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get session from cookie
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('conductor_session')

  if (!sessionCookie?.value) {
    redirect('/login')
  }

  // Validate session
  let session: SessionPayload
  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET)
    const { payload } = await jwtVerify(sessionCookie.value, secret)
    session = payload as unknown as SessionPayload

    // Check expiry
    if (session.expiresAt <= Date.now()) {
      redirect('/login')
    }
  } catch {
    redirect('/login')
  }

  // Get platform from cookie for initial SSR
  const platformCookie = cookieStore.get('conductor_platform')
  const initialPlatform = (platformCookie?.value as 'music-vine' | 'uppbeat') || session.platform

  return (
    <PlatformLayoutClient
      initialPlatform={initialPlatform}
      userName={session.name}
      userEmail={session.email}
      userId={session.userId}
    >
      {children}
    </PlatformLayoutClient>
  )
}
