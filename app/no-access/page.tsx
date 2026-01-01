import Link from 'next/link'
import { requireEnv } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default function NoAccessPage() {
  const productId = requireEnv('WHOP_PRODUCT_ID')
  const checkoutUrl = `https://whop.com/checkout/${encodeURIComponent(productId)}`

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          You don’t have access
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Your Whop account doesn’t currently have an active SwiftConnect membership.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href={checkoutUrl}
            className="inline-flex items-center justify-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Get access on Whop
          </a>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Try a different Whop account
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          If you believe this is a mistake, make sure you’re logged into the Whop account that
          purchased SwiftConnect.
        </p>
      </div>
    </main>
  )
}

