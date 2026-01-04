import Link from 'next/link'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SwiftConnect</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          This is a B2B Whop App. Please open SwiftConnect from inside Whop to authenticate.
        </p>

        <div className="mt-6 flex flex-col gap-3">
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

