import { requireEnv } from '@/lib/env'

export type WhopOAuthTokenResponse = {
  access_token: string
  token_type?: string
  expires_in?: number
  refresh_token?: string
  scope?: string
}

const WHOP_AUTHORIZE_URL = 'https://whop.com/oauth/authorize'
const WHOP_TOKEN_URL = 'https://whop.com/oauth/token'
const WHOP_API_BASE_URL = 'https://api.whop.com/api/v2'

export function buildWhopAuthorizeUrl(args: { state: string }): string {
  const clientId = requireEnv('WHOP_CLIENT_ID')
  const redirectUri = requireEnv('WHOP_REDIRECT_URI')

  const url = new URL(WHOP_AUTHORIZE_URL)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('state', args.state)

  // MVP: request basic identity + memberships (if supported by Whop OAuth).
  // If your Whop app uses different scopes, update this list.
  url.searchParams.set('scope', 'identify email memberships businesses')

  return url.toString()
}

export async function exchangeWhopCodeForToken(args: {
  code: string
}): Promise<WhopOAuthTokenResponse> {
  const clientId = requireEnv('WHOP_CLIENT_ID')
  const clientSecret = requireEnv('WHOP_CLIENT_SECRET')
  const redirectUri = requireEnv('WHOP_REDIRECT_URI')

  const body = new URLSearchParams()
  body.set('grant_type', 'authorization_code')
  body.set('client_id', clientId)
  body.set('client_secret', clientSecret)
  body.set('redirect_uri', redirectUri)
  body.set('code', args.code)

  const res = await fetch(WHOP_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Whop token exchange failed (${res.status}): ${text}`)
  }

  return (await res.json()) as WhopOAuthTokenResponse
}

export type WhopViewer = {
  id: string
  email?: string | null
  name?: string | null
  memberships?: Array<{
    id: string
    status: string
    productId?: string | null
    business?: { id: string; name?: string | null } | null
  }>
}

export async function fetchWhopViewer(accessToken: string): Promise<WhopViewer> {
  const headers = { Authorization: `Bearer ${accessToken}` }

  const meRes = await fetch(`${WHOP_API_BASE_URL}/me`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  })
  if (!meRes.ok) {
    const text = await meRes.text().catch(() => '')
    throw new Error(`Whop /me failed (${meRes.status}): ${text}`)
  }
  const meJson = (await meRes.json()) as any
  const me = meJson?.data ?? meJson
  if (!me?.id) throw new Error('Whop /me response missing id')

  const membershipsRes = await fetch(`${WHOP_API_BASE_URL}/memberships`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  })
  if (!membershipsRes.ok) {
    const text = await membershipsRes.text().catch(() => '')
    throw new Error(`Whop /memberships failed (${membershipsRes.status}): ${text}`)
  }
  const membershipsJson = (await membershipsRes.json()) as any
  const rawMemberships = membershipsJson?.data ?? membershipsJson
  const list: any[] = Array.isArray(rawMemberships)
    ? rawMemberships
    : Array.isArray(rawMemberships?.items)
      ? rawMemberships.items
      : Array.isArray(rawMemberships?.memberships)
        ? rawMemberships.memberships
        : []

  const memberships = list
    .map((m: any) => {
      const businessId =
        m?.business?.id ?? m?.business_id ?? m?.workspace?.id ?? m?.workspace_id ?? null
      const businessName = m?.business?.name ?? m?.workspace?.name ?? null

      const productId =
        m?.product?.id ??
        m?.product_id ??
        m?.plan?.product?.id ??
        m?.plan?.product_id ??
        m?.plan?.product?.uuid ??
        null

      return {
        id: m?.id ? String(m.id) : '',
        status: String(m?.status ?? ''),
        productId: productId ? String(productId) : null,
        business: businessId ? { id: String(businessId), name: businessName ? String(businessName) : null } : null,
      }
    })
    .filter((m) => m.id)

  return {
    id: String(me.id),
    email: me.email ? String(me.email) : null,
    name: me.name ? String(me.name) : null,
    memberships,
  }
}

