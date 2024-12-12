'use client'

import React from 'react'
import Link from 'next/link'

export function InvoiceList() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">請求書一覧</h1>
        <Link
          href="/invoices/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          新規作成
        </Link>
      </div>
      {/* 請求書一覧の内容をここに追加 */}
    </div>
  )
} 