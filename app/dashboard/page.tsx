'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type PaymentStatus = 'FAILED' | 'CONTACTED' | 'RECOVERED'

interface FailedPayment {
  id: string
  createdAt: string
  customerName: string
  customerEmail: string
  productName: string
  amount: number
  currency: string
  reason: string | null
  status: PaymentStatus
}

function generateRecoveryMessage(payment: FailedPayment): string {
  const productLink = `https://yourstore.com/products/${encodeURIComponent(
    payment.productName
  )}`

  return `Hi ${payment.customerName},

We noticed there was an issue processing your payment of ${payment.currency} ${payment.amount.toFixed(2)} for "${payment.productName}".

${payment.reason ? `Reason: ${payment.reason}\n\n` : ''}This might have been due to an expired card, insufficient funds, or a temporary banking issue.

We'd love to help you complete your purchase. You can retry your payment here: ${productLink}

If you're experiencing any issues, please reply to this email and we'll be happy to assist.

Best regards,
Your Team`
}

function getStatusColor(status: PaymentStatus): string {
  switch (status) {
    case 'FAILED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'CONTACTED':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'RECOVERED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

export default function Dashboard() {
  const [payments, setPayments] = useState<FailedPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const router = useRouter()

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments')
      const data = await response.json()
      setPayments(data)
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const updateStatus = async (id: string, status: PaymentStatus) => {
    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchPayments()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const copyMessage = async (payment: FailedPayment) => {
    const message = generateRecoveryMessage(payment)
    try {
      await navigator.clipboard.writeText(message)
      setCopySuccess(payment.id)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (error) {
      console.error('Error copying message:', error)
    }
  }

  const createSamplePayment = async () => {
    try {
      const response = await fetch('/api/seed', { method: 'POST' })
      if (response.ok) {
        fetchPayments()
      }
    } catch (error) {
      console.error('Error creating sample payment:', error)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Failed Payments Dashboard
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track and recover revenue from failed customer payments
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Home
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Logout
            </button>
            <button
              onClick={createSamplePayment}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Create Sample Payment
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              No failed payments yet
            </p>
            <button
              onClick={createSamplePayment}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
            >
              Create Sample Payment
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {payment.customerName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.customerEmail}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {payment.productName}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {payment.currency} {payment.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {payment.reason || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex flex-col sm:flex-row gap-2 justify-end">
                          <button
                            onClick={() => copyMessage(payment)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors text-xs font-medium"
                          >
                            {copySuccess === payment.id ? 'Copied!' : 'Copy Message'}
                          </button>
                          {payment.status !== 'CONTACTED' && (
                            <button
                              onClick={() => updateStatus(payment.id, 'CONTACTED')}
                              className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors text-xs font-medium"
                            >
                              Mark Contacted
                            </button>
                          )}
                          {payment.status !== 'RECOVERED' && (
                            <button
                              onClick={() => updateStatus(payment.id, 'RECOVERED')}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-xs font-medium"
                            >
                              Mark Recovered
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

