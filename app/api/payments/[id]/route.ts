import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = request.headers.get('x-sc-company-id')
    if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const company = await prisma.company.upsert({
      where: { companyId },
      update: {},
      create: { companyId },
      select: { id: true },
    })

    const { status } = await request.json()

    if (!status || !['FAILED', 'CONTACTED', 'RECOVERED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const result = await prisma.failedPayment.updateMany({
      where: { id: params.id, companyId: company.id },
      data: { status },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updated = await prisma.failedPayment.findFirst({
      where: { id: params.id, companyId: company.id },
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

