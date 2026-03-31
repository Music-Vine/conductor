/**
 * Cognito PKCE helpers for the Authorization Code flow.
 *
 * Environment variables required:
 *   NEXT_PUBLIC_COGNITO_CLIENT_ID  — Cognito app client ID (public, safe for browser)
 *   COGNITO_DOMAIN                 — Full Cognito domain URL, e.g. https://hades-uppbeat-api-access.auth.eu-west-2.amazoncognito.com
 *   COGNITO_REDIRECT_URI           — Callback URL, e.g. https://musicvine-admin.ub-hades-.../auth/callback
 *   COGNITO_API_SCOPE              — Resource server scope, e.g. hades-api/access
 */

const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!
const COGNITO_DOMAIN = process.env.COGNITO_DOMAIN!
const REDIRECT_URI = process.env.COGNITO_REDIRECT_URI!
const API_SCOPE = process.env.COGNITO_API_SCOPE!

const OIDC_SCOPES = `openid email profile ${API_SCOPE}`

export interface CognitoTokenResponse {
  access_token: string
  id_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

/**
 * Builds the Cognito Hosted UI authorization URL.
 * Include the PKCE code_challenge and a state value for CSRF protection.
 */
export function buildCognitoLoginUrl(state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    scope: OIDC_SCOPES,
    redirect_uri: REDIRECT_URI,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  })
  return `${COGNITO_DOMAIN}/oauth2/authorize?${params}`
}

/**
 * Exchanges an authorization code for access/id/refresh tokens.
 * Called server-side in the /auth/callback route handler.
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<CognitoTokenResponse> {
  const res = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Cognito token exchange failed (${res.status}): ${body}`)
  }

  return res.json()
}

/**
 * Exchanges a refresh token for a new access token.
 * Call this when the access token has expired (tokenExpiresAt <= Date.now()).
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<Pick<CognitoTokenResponse, 'access_token' | 'expires_in'>> {
  const res = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Cognito token refresh failed (${res.status}): ${body}`)
  }

  return res.json()
}

/**
 * Builds the Cognito logout URL.
 * Redirecting here invalidates the Cognito session in addition to clearing the local session cookie.
 */
export function buildCognitoLogoutUrl(): string {
  const logoutRedirect = REDIRECT_URI.replace('/auth/callback', '/')
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    logout_uri: logoutRedirect,
  })
  return `${COGNITO_DOMAIN}/logout?${params}`
}
