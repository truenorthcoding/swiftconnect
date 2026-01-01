import { jwtVerify, type JWTPayload } from 'jose'

export const WHOP_JWT_COOKIE = 'whop_app_jwt'

export type WhopAppClaims = {
  companyId: string
  userId: string
  membershipId: string
  raw: JWTPayload
}

function pickString(payload: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = payload[k]
    if (typeof v === 'string' && v.length > 0) return v
  }
  return null
}

export async function verifyWhopAppJwt(token: string): Promise<WhopAppClaims> {
  const secret = process.env.WHOP_APP_SECRET
  if (!secret) {
    throw new Error('Missing WHOP_APP_SECRET')
  }

  const key = new TextEncoder().encode(secret)
  const { payload } = await jwtVerify(token, key)

  const companyId = pickString(payload as any, ['company_id', 'companyId', 'company', 'company'])
  const userId = pickString(payload as any, ['user_id', 'userId', 'user'])
  const membershipId = pickString(payload as any, [
    'membership_id',
    'membershipId',
    'membership',
    'access_id',
  ])

  if (!companyId || !userId || !membershipId) {
    throw new Error('Whop JWT missing required claims (company_id, user_id, membership_id)')
  }

  return { companyId, userId, membershipId, raw: payload }
}

