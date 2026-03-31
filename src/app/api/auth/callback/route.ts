import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '@/lib/auth/cognito'
import { signSession } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const returnedState = searchParams.get('state')

  const codeVerifier = request.cookies.get('pkce_verifier')?.value
  const expectedState = request.cookies.get('oauth_state')?.value

  // Validate required params
  if (!code || !codeVerifier) {
    return NextResponse.redirect(new URL('/login?error=missing_params', request.url))
  }

  // CSRF check — state must match what we stored before the redirect
  if (!returnedState || returnedState !== expectedState) {
    return NextResponse.redirect(new URL('/login?error=invalid_state', request.url))
  }

  let tokens
  try {
    tokens = await exchangeCodeForTokens(code, codeVerifier)
  } catch {
    return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url))
  }

  // Decode the id_token to extract user info.
  // No signature verification needed here — Cognito already verified it before issuing it.
  const [, payloadB64] = tokens.id_token.split('.')
  const idTokenPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'))

  const { token, expiresAt, cookieName } = await signSession({
    userId: idTokenPayload.sub as string,
    email: (idTokenPayload.email as string) ?? '',
    name: (idTokenPayload.name as string) ?? (idTokenPayload.email as string) ?? '',
    platform: 'music-vine',
    refreshToken: tokens.refresh_token,
    tokenExpiresAt: Date.now() + tokens.expires_in * 1000,
  })

  const response = NextResponse.redirect(new URL('/', request.url))

  // Set session cookie directly on the response so it's included in the redirect
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(expiresAt),
    path: '/',
  })

  // Clean up the PKCE and state cookies — they're single-use
  response.cookies.delete('pkce_verifier')
  response.cookies.delete('oauth_state')

  return response
}
