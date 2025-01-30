'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useCallback } from "react"
import { SerializedInvoice } from "@/types/invoice"
import { formatDate } from "@/lib/utils/date"
import { formatCurrency } from "@/lib/utils/format"
import { AccountType } from "@/types/bankAccount"

interface InvoicePreviewProps {
  invoice: SerializedInvoice;
  onClose: () => void;
}

export function InvoicePreview({ invoice, onClose }: InvoicePreviewProps) {
  const [open, setOpen] = useState(true)

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      onClose();
    }
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-white max-w-4xl overflow-y-auto max-h-[90vh]" style={{ backgroundColor: 'white' }}>
        <DialogHeader className="bg-white sticky top-0 z-10 pb-4 border-b">
          <DialogTitle>請求書プレビュー</DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-6 bg-white">
          <div className="flex justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-4">請求書</h2>
              <p className="text-sm text-gray-600">請求書番号: {invoice.invoiceNumber || '未設定'}</p>
              <p className="text-sm text-gray-600">発行日: {formatDate(new Date(invoice.issueDate))}</p>
              <p className="text-sm text-gray-600">支払期限: {formatDate(new Date(invoice.dueDate))}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">請求金額</p>
              <p className="text-2xl font-bold">{formatCurrency(invoice.totalAmount)}</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">請求先</h3>
            <p>{invoice.vendor.name}</p>
            <p>{invoice.vendor.address || '住所未設定'}</p>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">請求内容</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">項目</th>
                  <th className="px-4 py-2 text-right">数量</th>
                  <th className="px-4 py-2 text-right">単価</th>
                  <th className="px-4 py-2 text-right">税率</th>
                  <th className="px-4 py-2 text-right">金額</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{item.itemName}</td>
                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-2 text-right">{Number(item.taxRate) * 100}%</td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(String(Number(item.unitPrice) * item.quantity))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right font-semibold">小計</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(invoice.totalAmount)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right font-semibold">消費税</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(invoice.taxAmount)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right font-semibold">合計</td>
                  <td className="px-4 py-2 text-right font-bold">{formatCurrency(invoice.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {invoice.notes && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">備考</h3>
              <p className="whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {invoice.bankInfo && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">お振込先</h3>
              <p>{invoice.bankInfo.bankName} {invoice.bankInfo.branchName}支店</p>
              <p>{invoice.bankInfo.accountType === AccountType.ORDINARY ? '普通' : '当座'} {invoice.bankInfo.accountNumber}</p>
              <p>口座名義: {invoice.bankInfo.accountHolder}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}