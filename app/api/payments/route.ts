import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.headers.get('x-sc-company-id')
    if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const company = await prisma.company.upsert({
      where: { companyId },
      update: {},
      create: { companyId },
      select: { id: true },
    })

    const payments = await prisma.failedPayment.findMany({
      where: { companyId: company.id },
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
