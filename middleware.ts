import { NextRequest, NextResponse } from 'next/server'
import { verifyWhopAppJwt, WHOP_JWT_COOKIE } from '@/lib/whopAppAuth'

export const config = {
  matcher: ['/dashboard/:path*', '/api/payments/:path*', '/api/seed'],
}

function isApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/')
}

export async function middleware(request: NextRequest) {
  const url = new URL(request.url)

  const tokenFromHeader =
    request.headers.get('x-whop-jwt') ??
    request.headers.get('x-whop-auth') ??
    request.headers.get('x-whop-token')

  const tokenFromAuthorization = (() => {
    const auth = request.headers.get('authorization')
    if (!auth) return null
    const [type, value] = auth.split(' ')
    if (type?.toLowerCase() !== 'bearer') return null
    return value || null
  })()

  const tokenFromQuery =
    url.searchParams.get('whop_jwt') ??
    url.searchParams.get('whopJwt') ??
    url.searchParams.get('token')

  const tokenFromCookie = request.cookies.get(WHOP_JWT_COOKIE)?.value

  const token = tokenFromCookie || tokenFromHeader || tokenFromAuthorization || tokenFromQuery

  if (!token) {
    if (isApiPath(url.pathname)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const claims = await verifyWhopAppJwt(token)

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-sc-company-id', claims.companyId)
    requestHeaders.set('x-sc-user-id', claims.userId)
    requestHeaders.set('x-sc-membership-id', claims.membershipId)

    const res = NextResponse.next({ request: { headers: requestHeaders } })

    // Persist the Whop JWT in an HttpOnly cookie so client-side fetches work.
    // (Whop may send the JWT on initial navigation via header/query.)
    if (!tokenFromCookie) {
      res.cookies.set(WHOP_JWT_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
    }

    return res
  } catch {
    if (isApiPath(url.pathname)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.cookies.delete(WHOP_JWT_COOKIE)
    return res
  }
}

