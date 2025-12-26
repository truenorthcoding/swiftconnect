import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    const expectedPassword = process.env.DASHBOARD_PASSWORD

    if (!expectedPassword) {
      console.error('DASHBOARD_PASSWORD environment variable is not set')
      return NextResponse.json(
        { error: 'Server configuration error: DASHBOARD_PASSWORD not set' },
        { status: 500 }
      )
    }

    // Debug logging (remove in production if needed)
    console.log('Login attempt - password provided:', password ? 'yes' : 'no')
    console.log('Expected password length:', expectedPassword.length)

    if (password !== expectedPassword) {
      console.log('Password mismatch')
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    console.log('Password match - setting cookie')

    // Set authentication cookie (expires in 30 days)
    const response = NextResponse.json({ success: true })
    response.cookies.set('dashboard-auth', 'authenticated', {
      httpOnly: true,
      secure: true, // Always secure on Vercel (HTTPS)
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
    
    console.log('Cookie set successfully')

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

