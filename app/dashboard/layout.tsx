import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const h = await headers()
  const companyId = h.get('x-sc-company-id')

  // middleware enforces auth; this is a safety net
  if (companyId) {
    await prisma.company.upsert({
      where: { companyId },
      update: {},
      create: { companyId },
    })
  }

  return children
}

