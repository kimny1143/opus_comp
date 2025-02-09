'use client'

import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' })
  }

  if (status === 'loading') {
    return <div className="p-4">Loading...</div>
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              ダッシュボード
            </h1>
            <span className="ml-4 text-sm text-gray-500">
              {session?.user?.email}
            </span>
          </div>
          <Button
            onClick={handleLogout}
            data-cy="logout-button"
            variant="outline"
          >
            ログアウト
          </Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* 取引先管理カード */}
          <Link
            href="/vendors"
            className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="h-full flex flex-col">
              <h2 className="text-xl font-semibold text-gray-900">取引先管理</h2>
              <p className="mt-2 text-gray-600 flex-grow">
                取引先の登録・編集・削除を行います
              </p>
            </div>
          </Link>

          {/* 請求書管理カード */}
          <Link
            href="/invoices"
            className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="h-full flex flex-col">
              <h2 className="text-xl font-semibold text-gray-900">請求書管理</h2>
              <p className="mt-2 text-gray-600 flex-grow">
                請求書の作成・編集・PDF出力を行います
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}