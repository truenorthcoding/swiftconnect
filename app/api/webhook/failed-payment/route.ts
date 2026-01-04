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
      // B2B tenant routing (Whop company_id)
      company_id,
      companyId,
      customerName,
      customerEmail,
      productName,
      amount,
      currency = 'USD',
      reason,
    } = body

    const headerCompanyId = request.headers.get('x-whop-company-id')
    const effectiveCompanyId = company_id || companyId || headerCompanyId

    if (!effectiveCompanyId) {
      return NextResponse.json(
        { error: 'Missing company_id (or x-whop-company-id header)' },
        { status: 400 }
      )
    }

    if (!customerName || !customerEmail || !productName || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const company = await prisma.company.upsert({
      where: { companyId: String(effectiveCompanyId) },
      update: {},
      create: { companyId: String(effectiveCompanyId), name: null },
      select: { id: true },
    })

    // Create failed payment record
    const failedPayment = await prisma.failedPayment.create({
      data: {
        companyId: company.id,
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

