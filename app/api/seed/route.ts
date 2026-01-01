import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendDiscordNotification } from '@/lib/discord'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const companyId = request.headers.get('x-sc-company-id')
    if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const company = await prisma.company.upsert({
      where: { companyId },
      update: {},
      create: { companyId },
      select: { id: true },
    })

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
        companyId: company.id,
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

