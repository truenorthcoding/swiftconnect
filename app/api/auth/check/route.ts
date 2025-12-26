import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('dashboard-auth')
    
    const isAuthenticated = authCookie?.value === 'authenticated'

    return NextResponse.json({ authenticated: isAuthenticated })
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}

