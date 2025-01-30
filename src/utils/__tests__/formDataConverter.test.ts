import { Prisma } from '@prisma/client'
import { convertToFormData, convertFromFormData, convertFromPurchaseOrder } from '../formDataConverter'
import { ExtendedInvoice } from '@/types/invoice'
import { InvoiceFormData } from '@/components/forms/schemas/orderSchema'
import { AccountType } from '@/types/bankAccount'

describe('formDataConverter', () => {
  const mockApiData: Partial<ExtendedInvoice> = {
    vendorId: 'vendor-1',
    purchaseOrderId: 'po-1',
    status: 'DRAFT',
    issueDate: new Date('2024-01-01T00:00:00.000Z'),
    dueDate: new Date('2024-01-31T00:00:00.000Z'),
    items: [
      {
        id: 'item-1',
        itemName: '商品A',
        quantity: 2,
        unitPrice: new Prisma.Decimal(1000),
        taxRate: new Prisma.Decimal(0.1),
        description: 'テスト商品A'
      }
    ],
    notes: 'テスト請求書',
    bankInfo: {
      bankName: 'テスト銀行',
      branchName: 'テスト支店',
      accountType: AccountType.ORDINARY,
      accountNumber: '1234567',
      accountHolder: 'テスト太郎'
    }
  }

  describe('convertToFormData', () => {
    it('APIレスポンスデータを正しくフォームデータに変換できること', () => {
      const result = convertToFormData(mockApiData)
      
      expect(result.vendorId).toBe(mockApiData.vendorId)
      expect(result.purchaseOrderId).toBe(mockApiData.purchaseOrderId)
      expect(result.status).toBe(mockApiData.status)
      expect(result.issueDate).toEqual(new Date(mockApiData.issueDate!))
      expect(result.dueDate).toEqual(new Date(mockApiData.dueDate!))
      expect(result.notes).toBe(mockApiData.notes)
      
      // items の変換を確認
      expect(result.items[0]).toEqual({
        id: 'item-1',
        itemName: '商品A',
        quantity: 2,
        unitPrice: 1000,
        taxRate: 0.1,
        description: 'テスト商品A'
      })

      // bankInfo の変換を確認
      expect(result.bankInfo).toEqual(mockApiData.bankInfo)
    })

    it('空のデータの場合はデフォルト値を設定すること', () => {
      const result = convertToFormData({})
      
      expect(result.vendorId).toBe('')
      expect(result.purchaseOrderId).toBe('')
      expect(result.status).toBe('DRAFT')
      expect(result.items).toEqual([])
      expect(result.notes).toBe('')
      expect(result.bankInfo).toEqual({
        bankName: '',
        branchName: '',
        accountType: AccountType.ORDINARY,
        accountNumber: '',
        accountHolder: ''
      })
    })
  })

  describe('convertFromFormData', () => {
    const mockFormData: InvoiceFormData = {
      vendorId: 'vendor-1',
      purchaseOrderId: 'po-1',
      status: 'DRAFT',
      issueDate: new Date('2024-01-01'),
      dueDate: new Date('2024-01-31'),
      items: [
        {
          id: 'item-1',
          itemName: '商品A',
          quantity: 2,
          unitPrice: 1000,
          taxRate: 0.1,
          description: 'テスト商品A'
        }
      ],
      notes: 'テスト請求書',
      bankInfo: {
        bankName: 'テスト銀行',
        branchName: 'テスト支店',
        accountType: AccountType.ORDINARY,
        accountNumber: '1234567',
        accountHolder: 'テスト太郎'
      }
    }

    it('フォームデータを正しくAPI送信用データに変換できること', () => {
      const result = convertFromFormData(mockFormData)
      
      expect(result.vendorId).toBe(mockFormData.vendorId)
      expect(result.purchaseOrderId).toBe(mockFormData.purchaseOrderId)
      expect(result.status).toBe(mockFormData.status)
      expect(result.issueDate).toBe(mockFormData.issueDate.toISOString())
      expect(result.dueDate).toBe(mockFormData.dueDate.toISOString())
      expect(result.notes).toBe(mockFormData.notes)
      
      // items の変換を確認
      expect(result.items[0].unitPrice).toBeInstanceOf(Prisma.Decimal)
      expect(result.items[0].taxRate).toBeInstanceOf(Prisma.Decimal)
      expect(Number(result.items[0].unitPrice)).toBe(1000)
      expect(Number(result.items[0].taxRate)).toBe(0.1)

      // bankInfo の変換を確認
      expect(result.bankInfo).toEqual(mockFormData.bankInfo)
    })
  })

  describe('convertFromPurchaseOrder', () => {
    const mockPurchaseOrder = {
      id: 'po-1',
      vendorId: 'vendor-1',
      items: [
        {
          id: 'item-1',
          itemName: '商品A',
          quantity: 2,
          unitPrice: 1000,
          taxRate: 0.1,
          description: 'テスト商品A'
        }
      ],
      vendor: {
        bankInfo: {
          bankName: 'テスト銀行',
          branchName: 'テスト支店',
          accountType: AccountType.ORDINARY,
          accountNumber: '1234567',
          accountHolder: 'テスト太郎'
        }
      }
    }

    it('発注書データを正しく請求書フォームデータに変換できること', () => {
      const result = convertFromPurchaseOrder(mockPurchaseOrder)
      
      expect(result.vendorId).toBe(mockPurchaseOrder.vendorId)
      expect(result.purchaseOrderId).toBe(mockPurchaseOrder.id)
      
      // items の変換を確認
      expect(result.items[0]).toEqual({
        id: 'item-1',
        itemName: '商品A',
        quantity: 2,
        unitPrice: 1000,
        taxRate: 0.1,
        description: 'テスト商品A'
      })

      // bankInfo の変換を確認
      expect(result.bankInfo).toEqual(mockPurchaseOrder.vendor.bankInfo)
    })

    it('銀行情報がない場合はデフォルト値を設定すること', () => {
      const purchaseOrderWithoutBankInfo = {
        ...mockPurchaseOrder,
        vendor: { bankInfo: null }
      }

      const result = convertFromPurchaseOrder(purchaseOrderWithoutBankInfo)
      
      expect(result.bankInfo).toEqual({
        bankName: '',
        branchName: '',
        accountType: AccountType.ORDINARY,
        accountNumber: '',
        accountHolder: ''
      })
    })
  })
}) 