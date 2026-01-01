import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getActiveMembershipStatus, getAuthContextFromCookies } from '@/lib/auth'
import { requireEnv } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const cookieStore = await cookies()
  const ctx = await getAuthContextFromCookies(cookieStore)

  if (ctx) {
    const productId = requireEnv('WHOP_PRODUCT_ID')
    const membership = await getActiveMembershipStatus({
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
      productId,
    })

    if ((membership?.status ?? '').toLowerCase() === 'active') {
      redirect('/dashboard')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Sign in to SwiftConnect
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Continue with Whop to access your dashboard.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/api/auth/whop"
            className="inline-flex items-center justify-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Continue with Whop
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}

