import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActiveMembershipStatus, getAuthContextFromCookies } from '@/lib/auth'
import { requireEnv } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { status } = await request.json()

    if (!status || !['FAILED', 'CONTACTED', 'RECOVERED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const result = await prisma.failedPayment.updateMany({
      where: { id: params.id, workspaceId: ctx.workspaceId },
      data: { status },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updated = await prisma.failedPayment.findFirst({
      where: { id: params.id, workspaceId: ctx.workspaceId },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

