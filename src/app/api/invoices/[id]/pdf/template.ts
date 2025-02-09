export function generateInvoiceHTML(invoice: any) {
  // 合計金額の取得(文字列から数値に変換)
  const total = Number(invoice.totalAmount);
  
  // 内税/外税に応じた計算
  let subtotal: number;
  let tax: number;
  
  if (invoice.taxIncluded) {
    // 内税の場合
    subtotal = Math.floor(total / 1.1);
    tax = total - subtotal;
  } else {
    // 外税の場合
    subtotal = total;
    tax = Math.floor(subtotal * 0.1);
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: sans-serif;
            margin: 0;
            padding: 40px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .info {
            margin-bottom: 30px;
          }
          .info p {
            margin: 5px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f8f9fa;
          }
          .totals {
            margin-left: auto;
            width: 300px;
          }
          .totals p {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .status {
            margin-top: 30px;
            text-align: right;
          }
          .tax-note {
            margin-top: 10px;
            font-size: 0.9em;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>請求書</h1>
        </div>

        <div class="info">
          <p><strong>請求書番号:</strong> ${invoice.invoiceNumber || '未設定'}</p>
          <p><strong>発行日:</strong> ${formatDate(invoice.issueDate)}</p>
          <p><strong>支払期限:</strong> ${formatDate(invoice.dueDate)}</p>
        </div>

        <div class="info">
          <h3>請求先:</h3>
          <p>${invoice.vendor.name}</p>
          <p>${invoice.vendor.email}</p>
          ${invoice.vendor.address ? `<p>${invoice.vendor.address}</p>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>項目</th>
              <th>数量</th>
              <th>単価</th>
              <th>金額</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items?.map((item: any) => {
              const amount = item.quantity * Number(item.unitPrice);
              return `
                <tr>
                  <td>
                    ${item.name}
                    ${item.description ? `<br><small>${item.description}</small>` : ''}
                  </td>
                  <td>${item.quantity}</td>
                  <td>¥${Number(item.unitPrice).toLocaleString()}</td>
                  <td>¥${amount.toLocaleString()}</td>
                </tr>
              `;
            }).join('') || ''}
          </tbody>
        </table>

        <div class="totals">
          <p>
            <span>小計:</span>
            <span>¥${subtotal.toLocaleString()}</span>
          </p>
          <p>
            <span>消費税(10%):</span>
            <span>¥${tax.toLocaleString()}</span>
          </p>
          <p style="font-weight: bold; font-size: 1.2em;">
            <span>合計${invoice.taxIncluded ? '(税込)' : '(税抜)'}:</span>
            <span>¥${invoice.taxIncluded ? total.toLocaleString() : (subtotal + tax).toLocaleString()}</span>
          </p>
          <div class="tax-note">
            ※ ${invoice.taxIncluded ? '内税' : '外税'} 表示
          </div>
        </div>

        <div class="status">
          <p><strong>ステータス:</strong> ${invoice.status === 'APPROVED' ? '承認済み' : '下書き'}</p>
        </div>

        <div class="footer">
          <p>本請求書はMVPシステムにより自動生成されました。</p>
        </div>
      </body>
    </html>
  `;
}

function formatDate(date: Date | null): string {
  if (!date) return '未設定';
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}