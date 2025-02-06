import { describe, it, expect } from 'vitest'
import { Prisma } from '@prisma/client'
import {
  convertDbItemToViewItem,
  convertDbInvoiceToView,
  convertFormToDbInput
} from '../invoice'
import { AccountType } from '@/types/base/common'
import { InvoiceStatus } from '@/types/base/invoice'

describe('Invoice Type Converters', () => {
  describe('convertDbItemToViewItem', () => {
    it('正しくDBアイテムをViewアイテムに変換できる', () => {
      const dbItem = {
        id: '1',
        invoiceId: 'inv-1',
        itemName: 'Test Item',
        description: 'Test Description',
        quantity: 2,
        unitPrice: 1000,
        taxRate: 10,
        amount: 2000,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const viewItem = convertDbItemToViewItem(dbItem)

      expect(viewItem).toEqual({
        id: '1',
        invoiceId: 'inv-1',
        itemName: 'Test Item',
        description: 'Test Description',
        quantity: 2,
        unitPrice: 1000,
        taxRate: 10,
        amount: 2000,
        taxAmount: '200.00',
        taxableAmount: '2000.00'
      })
    })

    it('descriptionがnullの場合も正しく変換できる', () => {
      const dbItem = {
        id: '1',
        invoiceId: 'inv-1',
        itemName: 'Test Item',
        description: null,
        quantity: 2,
        unitPrice: 1000,
        taxRate: 10,
        amount: 2000,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const viewItem = convertDbItemToViewItem(dbItem)
      expect(viewItem.description).toBeNull()
    })
  })

  describe('convertDbInvoiceToView', () => {
    it('正しくDB請求書をView請求書に変換できる', () => {
      const now = new Date()
      const dbInvoice = {
        id: '1',
        invoiceNumber: 'INV-001',
        status: InvoiceStatus.DRAFT,
        issueDate: now,
        dueDate: now,
        notes: 'Test Notes',
        templateId: null,
        purchaseOrderId: null,
        bankInfo: {
          bankName: 'Test Bank',
          branchName: 'Test Branch',
          accountType: AccountType.ORDINARY,
          accountNumber: '1234567',
          accountHolder: 'Test Holder'
        },
        template: null,
        items: [{
          id: '1',
          invoiceId: 'inv-1',
          itemName: 'Test Item',
          description: 'Test Description',
          quantity: 2,
          unitPrice: 1000,
          taxRate: 10,
          amount: 2000,
          createdAt: now,
          updatedAt: now
        }],
        vendor: {
          id: '1',
          name: 'Test Vendor',
          registrationNumber: 'REG-001'
        },
        vendorId: '1',
        totalAmount: new Prisma.Decimal(2000),
        taxAmount: new Prisma.Decimal(200),
        taxSummary: {
          byRate: {
            '10': {
              taxRate: 10,
              taxableAmount: 2000,
              taxAmount: 200
            }
          },
          total: {
            taxableAmount: 2000,
            taxAmount: 200
          }
        },
        tags: [],
        statusHistory: [{
          id: '1',
          status: InvoiceStatus.DRAFT,
          createdAt: now,
          updatedAt: now,
          comment: 'Initial draft',
          userId: 'user-1'
        }],
        createdAt: now,
        updatedAt: now,
        createdById: 'user-1',
        updatedById: 'user-1'
      }

      const viewInvoice = convertDbInvoiceToView(dbInvoice)

      expect(viewInvoice.id).toBe('1')
      expect(viewInvoice.invoiceNumber).toBe('INV-001')
      expect(viewInvoice.status).toBe(InvoiceStatus.DRAFT)
      expect(viewInvoice.issueDate).toBe(now.toISOString())
      expect(viewInvoice.dueDate).toBe(now.toISOString())
      expect(viewInvoice.notes).toBe('Test Notes')
      expect(viewInvoice.bankInfo).toEqual({
        bankName: 'Test Bank',
        branchName: 'Test Branch',
        accountType: AccountType.ORDINARY,
        accountNumber: '1234567',
        accountHolder: 'Test Holder'
      })
      expect(viewInvoice.items).toHaveLength(1)
      expect(viewInvoice.totalAmount).toBe('2000.00')
      expect(viewInvoice.taxAmount).toBe('200.00')
    })
  })

  describe('convertFormToDbInput', () => {
    it('正しくフォームデータをDB入力に変換できる', () => {
      const now = new Date()
      const formData = {
        status: InvoiceStatus.DRAFT,
        registrationNumber: 'REG-001',
        vendorId: '1',
        issueDate: now,
        dueDate: now,
        items: [{
          id: '1',
          invoiceId: 'inv-1',
          itemName: 'Test Item',
          description: 'Test Description',
          quantity: 2,
          unitPrice: 1000,
          taxRate: 10,
          amount: 2000,
          taxAmount: '200.00',
          taxableAmount: '2000.00'
        }],
        bankInfo: {
          bankName: 'Test Bank',
          branchName: 'Test Branch',
          accountType: AccountType.ORDINARY,
          accountNumber: '1234567',
          accountHolder: 'Test Holder'
        },
        notes: 'Test Notes',
        tags: []
      }

      const dbInput = convertFormToDbInput(formData, 'user-1')

      expect(dbInput.status).toBe(InvoiceStatus.DRAFT)
      expect(dbInput.vendorId).toBe('1')
      expect(dbInput.issueDate).toBe(now)
      expect(dbInput.dueDate).toBe(now)
      expect(dbInput.notes).toBe('Test Notes')
      expect(dbInput.items.create).toHaveLength(1)
      expect(dbInput.totalAmount).toEqual(new Prisma.Decimal(2000))
      expect(dbInput.taxAmount).toEqual(new Prisma.Decimal(200))
      expect(dbInput.createdById).toBe('user-1')
      expect(dbInput.updatedById).toBe('user-1')
    })
  })
})
