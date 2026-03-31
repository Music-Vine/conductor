import { NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth'
import { buildCognitoLogoutUrl } from '@/lib/auth/cognito'

export async function POST() {
  await destroySession()
  return NextResponse.json({ success: true })
}

// GET used for logout links — clears the local session then ends the Cognito session too
export async function GET() {
  await destroySession()
  return NextResponse.redirect(buildCognitoLogoutUrl())
}
