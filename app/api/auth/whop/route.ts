import { NextRequest, NextResponse } from 'next/server'
import { buildWhopAuthorizeUrl } from '@/lib/whop'
import { generateToken, isProd, OAUTH_STATE_COOKIE_NAME } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  const state = generateToken(24)
  const authorizeUrl = buildWhopAuthorizeUrl({ state })

  const res = NextResponse.redirect(authorizeUrl)
  res.cookies.set(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: isProd(),
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  })

  return res
}

