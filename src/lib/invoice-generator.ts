import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface InvoiceItem {
  itemName: string
  description: string | null
  quantity: number
  unitPrice: number
  taxRate: number
}

interface InvoiceData {
  issueDate: string
  dueDate: string
  items: InvoiceItem[]
  vendor: {
    name: string
    address: string | null
    registrationNumber: string
  }
  bankInfo: {
    bankName: string
    branchName: string
    accountType: string
    accountNumber: string
    accountHolder: string
  }
}

export async function generateInvoiceHtml(data: InvoiceData): Promise<string> {
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'yyyy年M月d日', { locale: ja })
  }

  const calculateSubtotal = (items: InvoiceItem[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const calculateTax = (items: InvoiceItem[]) => {
    return items.reduce((sum, item) => {
      const itemAmount = item.quantity * item.unitPrice
      return sum + (itemAmount * item.taxRate)
    }, 0)
  }

  const calculateTotal = (items: InvoiceItem[]) => {
    const subtotal = calculateSubtotal(items)
    const tax = calculateTax(items)
    return subtotal + tax
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>請求書</title>
      <style>
        body {
          font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: white;
        }
        .invoice {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          border: 1px solid #ddd;
          background-color: white;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .dates {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .company-info {
          margin-bottom: 30px;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .table th,
        .table td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        .table th {
          background-color: #f8f9fa;
        }
        .amount-info {
          text-align: right;
          margin-bottom: 30px;
        }
        .bank-info {
          margin-top: 40px;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <div class="title">請求書</div>
        </div>
        
        <div class="dates">
          <div>発行日: ${formatDate(data.issueDate)}</div>
          <div>支払期限: ${formatDate(data.dueDate)}</div>
        </div>

        <div class="company-info">
          <h3>${data.vendor.name} 御中</h3>
          ${data.vendor.address ? `<p>${data.vendor.address}</p>` : ''}
          <p>登録番号: ${data.vendor.registrationNumber}</p>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>項目</th>
              <th>数量</th>
              <th>単価</th>
              <th>税率</th>
              <th>金額</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td>${item.itemName}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unitPrice)}</td>
                <td>${(item.taxRate * 100).toFixed(1)}%</td>
                <td>${formatCurrency(item.quantity * item.unitPrice)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="amount-info">
          <p>小計: ${formatCurrency(calculateSubtotal(data.items))}</p>
          <p>消費税: ${formatCurrency(calculateTax(data.items))}</p>
          <p>合計: ${formatCurrency(calculateTotal(data.items))}</p>
        </div>

        <div class="bank-info">
          <h3>お振込先</h3>
          <p>銀行名: ${data.bankInfo.bankName}</p>
          <p>支店名: ${data.bankInfo.branchName}</p>
          <p>口座種別: ${data.bankInfo.accountType}</p>
          <p>口座番号: ${data.bankInfo.accountNumber}</p>
          <p>口座名義: ${data.bankInfo.accountHolder}</p>
        </div>
      </div>
    </body>
    </html>
  `
} 