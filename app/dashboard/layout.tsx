import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getActiveMembershipStatus, getAuthContextFromCookies } from '@/lib/auth'
import { requireEnv } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const ctx = await getAuthContextFromCookies(cookieStore)

  if (!ctx) {
    redirect('/login')
  }

  const productId = requireEnv('WHOP_PRODUCT_ID')
  const membership = await getActiveMembershipStatus({
    userId: ctx.userId,
    workspaceId: ctx.workspaceId,
    productId,
  })

  if ((membership?.status ?? '').toLowerCase() !== 'active') {
    redirect('/no-access')
  }

  return children
}

