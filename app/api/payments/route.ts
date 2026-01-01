import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActiveMembershipStatus, getAuthContextFromCookies } from '@/lib/auth'
import { requireEnv } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthContextFromCookies(request.cookies)
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const productId = requireEnv('WHOP_PRODUCT_ID')
    const membership = await getActiveMembershipStatus({
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
      productId,
    })
    if ((membership?.status ?? '').toLowerCase() !== 'active') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const payments = await prisma.failedPayment.findMany({
      where: { workspaceId: ctx.workspaceId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
