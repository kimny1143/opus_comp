import React from 'react';

interface Invoice {
  vendor: {
    registrationNumber: string;
  };
  items: Item[];
}

interface Item {
  description: string;
  quantity: number;
  unitPrice: number;
}

const InvoiceTemplate = ({ invoice }: { invoice: Invoice }) => {
  return (
    <div>
      <h1>請求書</h1>
      <p>登録番号: {invoice.vendor.registrationNumber}</p>
      {/* その他の必要な情報を表示 */}
      <table>
        <thead>
          <tr>
            <th>商品・サービス</th>
            <th>数量</th>
            <th>単価</th>
            <th>金額</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item: Item, index: number) => (
            <tr key={index}>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>{item.unitPrice}</td>
              <td>{item.quantity * item.unitPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* 消費税額や合計金額の表示 */}
    </div>
  );
};

export default InvoiceTemplate; 