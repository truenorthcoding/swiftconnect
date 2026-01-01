import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { requireEnv } from '@/lib/env'
import {
  createSession,
  isProd,
  OAUTH_STATE_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from '@/lib/auth'
import { exchangeWhopCodeForToken, fetchWhopViewer } from '@/lib/whop'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function isActiveStatus(status: string): boolean {
  return status.trim().toLowerCase() === 'active'
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  const cookieStore = await cookies()
  const expectedState = cookieStore.get(OAUTH_STATE_COOKIE_NAME)?.value

  if (!code || !state || !expectedState || state !== expectedState) {
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.cookies.delete(OAUTH_STATE_COOKIE_NAME)
    return res
  }

  const token = await exchangeWhopCodeForToken({ code })
  const viewer = await fetchWhopViewer(token.access_token)

  const productId = requireEnv('WHOP_PRODUCT_ID')

  const matching = (viewer.memberships ?? []).find(
    (m) => m.productId === productId && isActiveStatus(m.status) && m.business?.id
  )

  const whopBusinessId = matching?.business?.id ?? `personal_${viewer.id}`
  const workspaceName = matching?.business?.name ?? null

  const user = await prisma.user.upsert({
    where: { whopUserId: viewer.id },
    update: { email: viewer.email ?? null, name: viewer.name ?? null },
    create: { whopUserId: viewer.id, email: viewer.email ?? null, name: viewer.name ?? null },
  })

  const workspace = await prisma.workspace.upsert({
    where: { whopBusinessId },
    update: { name: workspaceName },
    create: { whopBusinessId, name: workspaceName },
  })

  const membershipStatus = matching ? 'active' : 'inactive'

  await prisma.membership.upsert({
    where: {
      userId_workspaceId_productId: {
        userId: user.id,
        workspaceId: workspace.id,
        productId,
      },
    },
    update: {
      status: membershipStatus,
      whopMembershipId: matching?.id ?? null,
    },
    create: {
      userId: user.id,
      workspaceId: workspace.id,
      productId,
      status: membershipStatus,
      whopMembershipId: matching?.id ?? null,
    },
  })

  const sessionExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days
  const whopTokenExpiresAt =
    typeof token.expires_in === 'number'
      ? new Date(Date.now() + token.expires_in * 1000)
      : null

  const session = await createSession({
    userId: user.id,
    workspaceId: workspace.id,
    expiresAt: sessionExpiresAt,
    whopAccessToken: token.access_token,
    whopAccessTokenExpiresAt: whopTokenExpiresAt,
  })

  const res = NextResponse.redirect(
    new URL(membershipStatus === 'active' ? '/dashboard' : '/no-access', request.url)
  )

  res.cookies.delete(OAUTH_STATE_COOKIE_NAME)
  res.cookies.set(SESSION_COOKIE_NAME, session.token, {
    httpOnly: true,
    secure: isProd(),
    sameSite: 'lax',
    path: '/',
    expires: sessionExpiresAt,
  })

  return res
}

