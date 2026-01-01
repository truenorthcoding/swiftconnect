import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendDiscordNotification } from '@/lib/discord'
import { NextRequest } from 'next/server'
import { getActiveMembershipStatus, getAuthContextFromCookies } from '@/lib/auth'
import { requireEnv } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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

    const sampleData = {
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      productName: 'Premium Membership',
      amount: 49.99,
      currency: 'USD',
      reason: 'Insufficient funds',
    }

    const failedPayment = await prisma.failedPayment.create({
      data: {
        ...sampleData,
        workspaceId: ctx.workspaceId,
        status: 'FAILED',
      },
    })

    // Send Discord notification for seed data too
    await sendDiscordNotification(sampleData)

    return NextResponse.json({
      success: true,
      message: 'Sample payment created',
      id: failedPayment.id,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

