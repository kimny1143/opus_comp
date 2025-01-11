import { render, screen, fireEvent } from '@testing-library/react'
import { InvoicePdfButton } from '../InvoicePdfButton'
import { Invoice } from '@/types/invoice'
import { VendorStatus, VendorCategory, BusinessType, InvoiceStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

// モックデータ
const mockInvoice: Invoice = {
  id: '1',
  invoiceNumber: 'INV-001',
  status: InvoiceStatus.DRAFT,
  issueDate: new Date('2024-01-01'),
  dueDate: new Date('2024-01-31'),
  totalAmount: new Decimal(11000),
  notes: null,
  vendorId: '1',
  items: [
    {
      id: '1',
      itemName: 'テスト商品',
      quantity: 1,
      unitPrice: '10000',
      taxRate: '0.1',
      description: null
    }
  ],
  vendor: {
    id: '1',
    name: 'テスト取引先',
    tradingName: 'テスト商事',
    code: 'TEST001',
    registrationNumber: '123456789',
    address: '東京都渋谷区',
    contactPerson: 'テスト担当者',
    status: VendorStatus.ACTIVE,
    category: VendorCategory.CORPORATION,
    businessType: BusinessType.MANUFACTURER,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: '1',
    updatedById: null,
    email: null,
    phone: null
  },
  bankInfo: {
    bankName: 'テスト銀行',
    branchName: 'テスト支店',
    accountType: 'ordinary',
    accountNumber: '1234567',
    accountHolder: 'テスト太郎'
  },
  template: {
    id: '1',
    contractorName: 'テスト会社',
    contractorAddress: '東京都港区',
    registrationNumber: '987654321',
    bankInfo: {
      bankName: 'テスト銀行',
      branchName: 'テスト支店',
      accountType: 'ordinary',
      accountNumber: '1234567',
      accountHolder: 'テスト太郎'
    }
  },
  templateId: '1',
  purchaseOrderId: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
  createdById: '1',
  updatedById: null
}

describe('InvoicePdfButton', () => {
  it('PDFダウンロードボタンが正しく表示される', () => {
    render(<InvoicePdfButton invoice={mockInvoice} />)
    expect(screen.getByRole('button', { name: /PDFダウンロード/i })).toBeInTheDocument()
  })

  it('ボタンクリックでPDF生成処理が呼ばれる', () => {
    const mockGeneratePdf = jest.fn()
    render(<InvoicePdfButton invoice={mockInvoice} onGeneratePdf={mockGeneratePdf} />)
    
    fireEvent.click(screen.getByRole('button', { name: /PDFダウンロード/i }))
    expect(mockGeneratePdf).toHaveBeenCalledWith(mockInvoice)
  })
}) 