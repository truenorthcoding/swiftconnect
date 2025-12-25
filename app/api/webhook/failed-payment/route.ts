import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendDiscordNotification } from '@/lib/discord'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check webhook secret
    const secret = request.headers.get('x-swiftconnect-secret')
    const expectedSecret = process.env.SWIFTCONNECT_WEBHOOK_SECRET

    if (!expectedSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    if (secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    const {
      customerName,
      customerEmail,
      productName,
      amount,
      currency = 'USD',
      reason,
    } = body

    if (!customerName || !customerEmail || !productName || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create failed payment record
    const failedPayment = await prisma.failedPayment.create({
      data: {
        customerName,
        customerEmail,
        productName,
        amount: parseFloat(amount),
        currency,
        reason: reason || null,
        status: 'FAILED',
      },
    })

    // Send Discord notification
    await sendDiscordNotification({
      customerName,
      customerEmail,
      productName,
      amount: parseFloat(amount),
      currency,
      reason,
    })

    return NextResponse.json({ success: true, id: failedPayment.id }, { status: 201 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

