'use client';

import { ExtendedInvoice } from '@/types/invoice';
import { formatCurrency } from '@/lib/utils/format';

interface InvoiceDetailProps {
  invoice: ExtendedInvoice;
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  return (
    <div className="p-8 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">請求書</h1>
        <div className="text-right">
          <p>請求書番号: {invoice.invoiceNumber}</p>
          <p>発行日: {invoice.issueDate?.toLocaleDateString()}</p>
          <p>支払期限: {invoice.dueDate?.toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">請求先</h2>
        <p>{invoice.vendor.name}</p>
        <p>{invoice.vendor.address}</p>
        <p>登録番号: {invoice.vendor.registrationNumber}</p>
      </div>

      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left p-2">品目</th>
            <th className="text-right p-2">数量</th>
            <th className="text-right p-2">単価</th>
            <th className="text-right p-2">税率</th>
            <th className="text-right p-2">金額</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="p-2">{item.itemName}</td>
              <td className="text-right p-2">{item.quantity}</td>
              <td className="text-right p-2">{formatCurrency(Number(item.unitPrice))}</td>
              <td className="text-right p-2">{Number(item.taxRate) * 100}%</td>
              <td className="text-right p-2">
                {formatCurrency(Number(item.unitPrice) * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between mb-2">
            <span>小計:</span>
            <span>{formatCurrency(Number(invoice.totalAmount))}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>消費税:</span>
            <span>{formatCurrency(Number(invoice.taxAmount))}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>合計:</span>
            <span>{formatCurrency(Number(invoice.total))}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">備考</h2>
          <p className="whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      {invoice.bankInfo && (
        <div>
          <h2 className="text-xl font-bold mb-2">お振込先</h2>
          <p>{invoice.bankInfo.bankName} {invoice.bankInfo.branchName}</p>
          <p>{invoice.bankInfo.accountType} {invoice.bankInfo.accountNumber}</p>
          <p>口座名義: {invoice.bankInfo.accountHolder}</p>
        </div>
      )}
    </div>
  );
} 