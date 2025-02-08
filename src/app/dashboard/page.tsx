import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            ダッシュボード
          </h1>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              data-cy="logout-button"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              ログアウト
            </button>
          </form>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* 取引先管理カード */}
          <Link
            href="/vendors"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900">取引先管理</h2>
            <p className="mt-2 text-gray-600">
              取引先の登録・編集・削除を行います
            </p>
          </Link>

          {/* 請求書管理カード */}
          <Link
            href="/invoices"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900">請求書管理</h2>
            <p className="mt-2 text-gray-600">
              請求書の作成・編集・PDF出力を行います
            </p>
          </Link>
        </div>
      </main>
    </div>
  )
}