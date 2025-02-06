import { Prisma } from '@prisma/client'
import type { DbInvoice, DbInvoiceCreateInput, DbInvoiceItem } from '@/types/db/invoice'
import type { ViewInvoice, ViewInvoiceItem, ViewInvoiceForm } from '@/types/view/invoice'
import type { BaseInvoiceItem, InvoiceStatus } from '@/types/base/invoice'
import type { BankInfo } from '@/types/base/common'
import { AccountType } from '@/types/base/common'

/**
 * BankInfoをJSONに変換
 */
function bankInfoToJson(bankInfo: BankInfo): Prisma.JsonValue {
  return {
    bankName: bankInfo.bankName,
    branchName: bankInfo.branchName,
    accountType: bankInfo.accountType,
    accountNumber: bankInfo.accountNumber,
    accountHolder: bankInfo.accountHolder
  }
}

/**
 * JSONをBankInfoに変換
 */
function jsonToBankInfo(json: Prisma.JsonValue): BankInfo {
  if (typeof json !== 'object' || json === null) {
    throw new Error('Invalid bank info format')
  }

  const bankInfo = json as Record<string, unknown>
  
  if (
    typeof bankInfo.bankName !== 'string' ||
    typeof bankInfo.branchName !== 'string' ||
    typeof bankInfo.accountNumber !== 'string' ||
    typeof bankInfo.accountHolder !== 'string' ||
    !Object.values(AccountType).includes(bankInfo.accountType as AccountType)
  ) {
    throw new Error('Invalid bank info data')
  }

  return {
    bankName: bankInfo.bankName,
    branchName: bankInfo.branchName,
    accountType: bankInfo.accountType as AccountType,
    accountNumber: bankInfo.accountNumber,
    accountHolder: bankInfo.accountHolder
  }
}

/**
 * DBのアイテムをViewのアイテムに変換
 */
export function convertDbItemToViewItem(dbItem: DbInvoiceItem): ViewInvoiceItem {
  return {
    id: dbItem.id,
    invoiceId: dbItem.invoiceId,
    itemName: dbItem.itemName,
    description: dbItem.description ?? null,
    quantity: dbItem.quantity,
    unitPrice: dbItem.unitPrice,
    taxRate: dbItem.taxRate,
    amount: dbItem.amount,
    taxAmount: dbItem.amount ? ((dbItem.amount * dbItem.taxRate) / 100).toFixed(2) : '0',
    taxableAmount: dbItem.amount ? dbItem.amount.toFixed(2) : '0'
  }
}

/**
 * DBの請求書をViewの請求書に変換
 */
export function convertDbInvoiceToView(dbInvoice: DbInvoice): ViewInvoice {
  const bankInfo = dbInvoice.bankInfo ? jsonToBankInfo(dbInvoice.bankInfo) : null
  if (!bankInfo) {
    throw new Error('Bank info is required')
  }

  return {
    id: dbInvoice.id,
    invoiceNumber: dbInvoice.invoiceNumber,
    status: dbInvoice.status,
    issueDate: dbInvoice.issueDate.toISOString(),
    dueDate: dbInvoice.dueDate.toISOString(),
    notes: dbInvoice.notes,
    bankInfo,
    template: dbInvoice.template ? {
      id: dbInvoice.template.id,
      name: dbInvoice.template.name,
      description: dbInvoice.template.description ?? undefined,
      bankInfo: dbInvoice.template.bankInfo,
      notes: dbInvoice.template.notes,
      paymentTerms: dbInvoice.template.paymentTerms,
      registrationNumber: dbInvoice.template.registrationNumber,
      contractorName: dbInvoice.template.contractorName,
      contractorAddress: dbInvoice.template.contractorAddress
    } : undefined,
    items: dbInvoice.items.map(convertDbItemToViewItem),
    vendor: {
      id: dbInvoice.vendor.id,
      name: dbInvoice.vendor.name,
      registrationNumber: dbInvoice.vendor.registrationNumber
    },
    totalAmount: dbInvoice.totalAmount.toFixed(2),
    taxAmount: dbInvoice.taxAmount.toFixed(2),
    taxSummary: dbInvoice.taxSummary,
    tags: dbInvoice.tags,
    statusHistory: dbInvoice.statusHistory.map(history => ({
      id: history.id,
      status: history.status as InvoiceStatus,
      createdAt: history.createdAt.toISOString(),
      comment: history.comment,
      user: {
        id: history.userId,
        name: 'Unknown' // Note: 実際のユーザー名は別途取得する必要があります
      }
    })),
    createdAt: dbInvoice.createdAt.toISOString(),
    updatedAt: dbInvoice.updatedAt.toISOString(),
    createdBy: {
      id: dbInvoice.createdById,
      name: 'Unknown' // Note: 実際のユーザー名は別途取得する必要があります
    },
    updatedBy: {
      id: dbInvoice.updatedById,
      name: 'Unknown' // Note: 実際のユーザー名は別途取得する必要があります
    }
  }
}

/**
 * フォームデータをDB作成用データに変換
 */
export function convertFormToDbInput(
  form: ViewInvoiceForm,
  userId: string
): DbInvoiceCreateInput {
  return {
    invoiceNumber: generateInvoiceNumber(), // Note: 実際の生成ロジックは別途実装
    status: form.status,
    issueDate: form.issueDate,
    dueDate: form.dueDate,
    notes: form.notes,
    bankInfo: bankInfoToJson(form.bankInfo),
    vendorId: form.vendorId,
    purchaseOrderId: form.purchaseOrderId,
    items: {
      create: form.items.map(item => ({
        itemName: item.itemName,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate
      }))
    },
    tags: form.tags.length > 0 ? {
      connect: form.tags.map(tag => ({ id: tag.id }))
    } : undefined,
    totalAmount: new Prisma.Decimal(
      form.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    ),
    taxAmount: new Prisma.Decimal(
      form.items.reduce((sum, item) => {
        const itemAmount = item.quantity * item.unitPrice
        return sum + (itemAmount * item.taxRate / 100)
      }, 0)
    ),
    taxSummary: calculateTaxSummary(form.items),
    createdById: userId,
    updatedById: userId
  }
}

/**
 * 税計算サマリーを生成
 */
function calculateTaxSummary(items: BaseInvoiceItem[]) {
  const summary = items.reduce((acc, item) => {
    const taxRate = item.taxRate.toString()
    const amount = item.quantity * item.unitPrice
    const taxAmount = (amount * item.taxRate) / 100

    if (!acc[taxRate]) {
      acc[taxRate] = {
        taxRate: item.taxRate,
        taxableAmount: amount,
        taxAmount: taxAmount
      }
    } else {
      acc[taxRate].taxableAmount += amount
      acc[taxRate].taxAmount += taxAmount
    }

    return acc
  }, {} as Record<string, { taxRate: number; taxableAmount: number; taxAmount: number }>)

  return {
    byRate: summary,
    total: {
      taxableAmount: Object.values(summary).reduce((sum, { taxableAmount }) => sum + taxableAmount, 0),
      taxAmount: Object.values(summary).reduce((sum, { taxAmount }) => sum + taxAmount, 0)
    }
  }
}

/**
 * 請求書番号を生成
 */
function generateInvoiceNumber(): string {
  // Note: 実際の生成ロジックは別途実装
  return `INV-${Date.now()}`
}