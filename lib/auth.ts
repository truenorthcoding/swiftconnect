import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export const SESSION_COOKIE_NAME = 'sc_session'
export const OAUTH_STATE_COOKIE_NAME = 'sc_oauth_state'

type CookieGetter = { get: (name: string) => { value: string } | undefined }

export type AuthContext = {
  userId: string
  workspaceId: string
}

export function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex')
}

export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('base64url')
}

export function isProd(): boolean {
  return process.env.NODE_ENV === 'production'
}

export async function getAuthContextFromCookies(
  cookieStore: CookieGetter
): Promise<AuthContext | null> {
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null

  const tokenHash = sha256Hex(token)
  const now = new Date()

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    select: { userId: true, workspaceId: true, expiresAt: true },
  })
  if (!session) return null
  if (session.expiresAt <= now) return null

  return { userId: session.userId, workspaceId: session.workspaceId }
}

export async function getActiveMembershipStatus(args: {
  userId: string
  workspaceId: string
  productId: string
}): Promise<{ status: string } | null> {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId_productId: {
        userId: args.userId,
        workspaceId: args.workspaceId,
        productId: args.productId,
      },
    },
    select: { status: true },
  })
  return membership
}

export async function createSession(args: {
  userId: string
  workspaceId: string
  expiresAt: Date
  whopAccessToken?: string
  whopAccessTokenExpiresAt?: Date | null
}): Promise<{ token: string }> {
  const token = generateToken(32)
  const tokenHash = sha256Hex(token)

  await prisma.session.create({
    data: {
      userId: args.userId,
      workspaceId: args.workspaceId,
      tokenHash,
      expiresAt: args.expiresAt,
      whopAccessToken: args.whopAccessToken,
      whopAccessTokenExpiresAt: args.whopAccessTokenExpiresAt ?? null,
    },
  })

  return { token }
}

export async function deleteSessionByToken(token: string): Promise<void> {
  const tokenHash = sha256Hex(token)
  await prisma.session
    .delete({ where: { tokenHash } })
    .catch(() => undefined) // ignore missing
}

