'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Invoice } from "@/types/invoice"
import { formatDate } from "@/lib/utils/date"

interface InvoicePreviewProps {
  invoice: Invoice;
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const [open, setOpen] = useState(false)

  const calculateSubtotal = (items: typeof invoice.items) => {
    return items.reduce((sum, item) => {
      const amount = Number(item.unitPrice) * item.quantity
      return sum + amount
    }, 0)
  }

  const calculateTaxTotal = (items: typeof invoice.items) => {
    return items.reduce((sum, item) => {
      const amount = Number(item.unitPrice) * item.quantity
      const tax = amount * Number(item.taxRate)
      return sum + tax
    }, 0)
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        プレビュー
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white max-w-4xl overflow-y-auto max-h-[90vh]" style={{ backgroundColor: 'white' }}>
          <DialogHeader className="bg-white sticky top-0 z-10 pb-4 border-b">
            <DialogTitle>請求書プレビュー</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6 bg-white">
            {/* ヘッダー情報 */}
            <div className="flex justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">請求書</h2>
                <p className="text-gray-600">請求書番号: {invoice.invoiceNumber || '-'}</p>
                <p className="text-gray-600">発行日: {invoice.issueDate ? formatDate(new Date(invoice.issueDate)) : '-'}</p>
                <p className="text-gray-600">支払期限: {invoice.dueDate ? formatDate(new Date(invoice.dueDate)) : '-'}</p>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-gray-900">{invoice.template.contractorName}</h3>
                <p className="text-gray-600">{invoice.template.contractorAddress}</p>
                <p className="text-gray-600">登録番号: {invoice.template.registrationNumber}</p>
              </div>
            </div>

            {/* 取引先情報 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2 text-gray-900">請求先</h3>
              <p className="text-gray-800">{invoice.vendor.name}</p>
              <p className="text-gray-600">{invoice.vendor.address || '-'}</p>
            </div>

            {/* 明細テーブル */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-2 px-4 text-gray-900">品目</th>
                    <th className="text-right py-2 px-4 text-gray-900">数量</th>
                    <th className="text-right py-2 px-4 text-gray-900">単価</th>
                    <th className="text-right py-2 px-4 text-gray-900">税率</th>
                    <th className="text-right py-2 px-4 text-gray-900">金額</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => {
                    const amount = Number(item.unitPrice) * item.quantity
                    return (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-4 text-gray-800">{item.itemName}</td>
                        <td className="text-right py-2 px-4 text-gray-800">{item.quantity}</td>
                        <td className="text-right py-2 px-4 text-gray-800">¥{Number(item.unitPrice).toLocaleString()}</td>
                        <td className="text-right py-2 px-4 text-gray-800">{Number(item.taxRate) * 100}%</td>
                        <td className="text-right py-2 px-4 text-gray-800">¥{amount.toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* 合計金額 */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-gray-800">
                  <span>小計:</span>
                  <span>¥{calculateSubtotal(invoice.items).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-800">
                  <span>消費税:</span>
                  <span>¥{calculateTaxTotal(invoice.items).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2 text-gray-900">
                  <span>合計:</span>
                  <span>¥{Number(invoice.totalAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 支払い情報 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2 text-gray-900">お支払い情報</h3>
              {invoice.bankInfo ? (
                <div className="space-y-1 text-gray-800">
                  <p>銀行名: {invoice.bankInfo.bankName}</p>
                  <p>支店名: {invoice.bankInfo.branchName}</p>
                  <p>口座種別: {invoice.bankInfo.accountType === 'ordinary' ? '普通' : '当座'}</p>
                  <p>口座番号: {invoice.bankInfo.accountNumber}</p>
                  <p>口座名義: {invoice.bankInfo.accountHolder}</p>
                </div>
              ) : (
                <div className="text-gray-600">
                  <p>口座情報は登録されていません</p>
                </div>
              )}
            </div>

            {/* 備考 */}
            {invoice.notes && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-gray-900">備考</h3>
                <p className="text-gray-800">{invoice.notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}