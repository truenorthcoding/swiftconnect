import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendDiscordNotification } from '@/lib/discord'

export async function POST() {
  try {
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

