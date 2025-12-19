import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
          SwiftConnect
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300">
          Recover revenue from failed payments
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          A creator dashboard that helps you detect, track, and recover from
          failed customer payments with ease.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200 text-lg"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  )
}

