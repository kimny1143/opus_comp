import React from 'react';
import { calculateTaxByRate } from '@/domains/invoice/tax';
import { formatCurrency } from '@/utils/format';

interface Invoice {
  vendor: {
    registrationNumber: string;
    name: string;
    address: string;
    tel: string;
    email: string;
  };
  client: {
    name: string;
    address: string;
  };
  items: Item[];
  issueDate: string;
  paymentDueDate: string;
  invoiceNumber: string;
}

interface Item {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

const InvoiceTemplate = ({ invoice }: { invoice: Invoice }) => {
  const taxSummary = calculateTaxByRate(
    invoice.items.map(item => ({
      ...item,
      unitPrice: item.unitPrice.toString(),
    }))
  );

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white">
      <div className="text-right mb-8">
        <p className="text-2xl font-bold">適格請求書</p>
        <p>発行日: {invoice.issueDate}</p>
        <p>請求書番号: {invoice.invoiceNumber}</p>
      </div>

      {/* 取引先情報 */}
      <div className="mb-8">
        <h2 className="text-xl mb-2">{invoice.client.name} 御中</h2>
        <p>{invoice.client.address}</p>
      </div>

      {/* 発行者情報 */}
      <div className="mb-8 text-right">
        <p className="font-bold">{invoice.vendor.name}</p>
        <p>{invoice.vendor.address}</p>
        <p>T: {invoice.vendor.tel}</p>
        <p>E: {invoice.vendor.email}</p>
        <p className="mt-2">
          <span className="font-bold">適格請求書発行事業者登録番号: </span>
          {invoice.vendor.registrationNumber}
        </p>
      </div>

      {/* 明細表 */}
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
            <tr key={index} className="border-b border-gray-100">
              <td className="p-2">{item.description}</td>
              <td className="text-right p-2">{item.quantity}</td>
              <td className="text-right p-2">{formatCurrency(item.unitPrice)}</td>
              <td className="text-right p-2">{item.taxRate * 100}%</td>
              <td className="text-right p-2">
                {formatCurrency(item.quantity * item.unitPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 税率ごとの集計 */}
      <div className="mb-8">
        <h3 className="font-bold mb-2">消費税内訳</h3>
        {taxSummary.byRate.map((tax) => (
          <div key={tax.taxRate} className="flex justify-between">
            <span>{tax.taxRate * 100}%対象: {formatCurrency(tax.taxableAmount)}</span>
            <span>消費税: {formatCurrency(tax.taxAmount)}</span>
          </div>
        ))}
      </div>

      {/* 合計金額 */}
      <div className="text-right">
        <div className="mb-2">
          <span className="mr-4">税抜合計</span>
          <span className="font-bold">{formatCurrency(taxSummary.totalTaxableAmount)}</span>
        </div>
        <div className="mb-2">
          <span className="mr-4">消費税合計</span>
          <span className="font-bold">{formatCurrency(taxSummary.totalTaxAmount)}</span>
        </div>
        <div className="text-xl">
          <span className="mr-4">請求金額合計</span>
          <span className="font-bold">
            {formatCurrency(taxSummary.totalTaxableAmount + taxSummary.totalTaxAmount)}
          </span>
        </div>
      </div>

      {/* 支払い期限 */}
      <div className="mt-8">
        <p>お支払い期限: {invoice.paymentDueDate}</p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
