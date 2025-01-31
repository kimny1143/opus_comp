import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import InvoicePdfButton from '../InvoicePdfButton'
import { QualifiedInvoice } from '@/types/invoice'
import { VendorStatus, VendorCategory, InvoiceStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { AccountType } from '@/types/bankAccount'

// モックデータ
const mockInvoice: QualifiedInvoice = {
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
      invoiceId: '1',
      itemName: 'テスト商品',
      quantity: 1,
      unitPrice: '10000',
      taxRate: 0.1,
      description: null,
      taxAmount: 1000,
      taxableAmount: 10000
    }
  ],
  vendor: {
    id: '1',
    name: 'テスト取引先',
    registrationNumber: '123456789',
    address: '東京都渋谷区',
    tel: null,
    email: null
  },
  bankInfo: {
    bankName: 'テスト銀行',
    branchName: 'テスト支店',
    accountType: AccountType.ORDINARY,
    accountNumber: '1234567',
    accountHolder: 'テスト太郎'
  },
  template: {
    id: '1',
    contractorName: 'テスト会社',
    contractorAddress: '東京都港区',
    registrationNumber: '987654321',
    bankInfo: JSON.stringify({
      bankName: 'テスト銀行',
      branchName: 'テスト支店',
      accountType: AccountType.ORDINARY,
      accountNumber: '1234567',
      accountHolder: 'テスト太郎'
    })
  },
  templateId: '1',
  purchaseOrderId: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
  createdById: '1',
  updatedById: null,
  taxSummary: {
    byRate: [
      {
        taxRate: 0.1,
        taxableAmount: new Decimal(10000),
        taxAmount: new Decimal(1000)
      }
    ],
    totalTaxableAmount: new Decimal(10000),
    totalTaxAmount: new Decimal(1000)
  },
  issuer: {
    name: 'テスト会社',
    registrationNumber: '987654321',
    address: '東京都港区'
  }
}

describe('InvoicePdfButton', () => {
  it('PDFダウンロードボタンが正しく表示される', () => {
    render(<InvoicePdfButton invoice={mockInvoice} />)
    expect(screen.getByRole('button', { name: /PDFをダウンロード/i })).toBeInTheDocument()
  })

  it('ボタンクリックでPDF生成処理が呼ばれる', () => {
    const mockGeneratePdf = vi.fn()
    render(<InvoicePdfButton invoice={mockInvoice} onGeneratePdf={mockGeneratePdf} />)
    
    fireEvent.click(screen.getByRole('button', { name: /PDFをダウンロード/i }))
    expect(mockGeneratePdf).toHaveBeenCalledWith(expect.any(Blob))
  })
})