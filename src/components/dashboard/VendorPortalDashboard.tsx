'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { InvoiceStatus } from '@prisma/client'
import { formatCurrency } from '@/lib/utils/format'
import type { Invoice } from '@/types/invoice'

interface VendorPortalDashboardProps {
  invoices: Invoice[]
  vendorId: string
}

export function VendorPortalDashboard({ invoices, vendorId }: VendorPortalDashboardProps) {
  // 請求書のステータス別集計
  const stats = {
    draft: invoices.filter(i => i.status === InvoiceStatus.DRAFT).length,
    pending: invoices.filter(i => i.status === InvoiceStatus.PENDING).length,
    approved: invoices.filter(i => i.status === InvoiceStatus.APPROVED).length,
    paid: invoices.filter(i => i.status === InvoiceStatus.PAID).length
  }

  // 合計請求金額の計算
  const totalAmount = invoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0)

  return (
    <div className="space-y-6">
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">取引先ポータル</h1>
        <Link href="/invoices/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            新規請求書作成
          </Button>
        </Link>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">下書き</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">承認待ち</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">承認済み</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">合計請求金額</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
          </CardContent>
        </Card>
      </div>

      {/* 最近の請求書一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>最近の請求書</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">請求書番号</th>
                  <th className="px-6 py-3">発行日</th>
                  <th className="px-6 py-3">金額</th>
                  <th className="px-6 py-3">ステータス</th>
                  <th className="px-6 py-3">アクション</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map((invoice) => (
                  <tr key={invoice.id} className="bg-white border-b">
                    <td className="px-6 py-4">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4">
                      {new Date(invoice.issueDate).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4">{formatCurrency(Number(invoice.totalAmount))}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        invoice.status === InvoiceStatus.DRAFT
                          ? 'bg-gray-100 text-gray-800'
                          : invoice.status === InvoiceStatus.PENDING
                          ? 'bg-yellow-100 text-yellow-800'
                          : invoice.status === InvoiceStatus.APPROVED
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === InvoiceStatus.PAID
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/invoices/${invoice.id}`}>
                        <Button variant="outline" size="sm">
                          詳細
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 