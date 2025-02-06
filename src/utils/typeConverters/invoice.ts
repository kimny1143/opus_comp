import { Prisma } from '@prisma/client'
import type { DbInvoice, DbInvoiceCreateInput, DbInvoiceItem } from '@/types/db/invoice'
import type { ViewInvoice, ViewInvoiceItem, ViewInvoiceForm } from '@/types/view/invoice'
import type { BaseInvoiceItem, InvoiceStatus } from '@/types/base/invoice'
import type { BankInfo, MonetaryAmount } from '@/types/base/common'
import { AccountType } from '@/types/base/common'

/**
 * MonetaryAmountをJSONに変換
 */
function monetaryAmountToJson(amount: MonetaryAmount): Prisma.JsonValue {
  return {
    amount: amount.amount,
    currency: amount.currency
  }
}

/**
 * JSONからMonetaryAmountに変換
 */
function jsonToMonetaryAmount(json: Prisma.JsonValue): MonetaryAmount {
  if (typeof json !== 'object' || json === null) {
    throw new Error('Invalid monetary amount format')
  }

  const amount = json as Record<string, unknown>
  
  if (
    typeof amount.amount !== 'number' ||
    typeof amount.currency !== 'string'
  ) {
    throw new Error('Invalid monetary amount data')
  }

  return {
    amount: amount.amount,
    currency: amount.currency
  }
}

/**
 * 税計算サマリーをJSONに変換
 */
function taxSummaryToJson(summary: {
  byRate: Record<string, {
    taxRate: number;
    taxableAmount: MonetaryAmount;
    taxAmount: MonetaryAmount
  }>;
  total: {
    taxableAmount: MonetaryAmount;
    taxAmount: MonetaryAmount;
  };
}): Prisma.JsonValue {
  return {
    byRate: Object.entries(summary.byRate).reduce((acc, [rate, data]) => ({
      ...acc,
      [rate]: {
        taxRate: data.taxRate,
        taxableAmount: monetaryAmountToJson(data.taxableAmount),
        taxAmount: monetaryAmountToJson(data.taxAmount)
      }
    }), {}),
    total: {
      taxableAmount: monetaryAmountToJson(summary.total.taxableAmount),
      taxAmount: monetaryAmountToJson(summary.total.taxAmount)
    }
  }
}

/**
 * MonetaryAmountをDecimalに変換
 */
function monetaryAmountToDecimal(amount: MonetaryAmount): Prisma.Decimal {
  return new Prisma.Decimal(amount.amount)
}

/**
 * DecimalをMonetaryAmountに変換
 */
function decimalToMonetaryAmount(decimal: Prisma.Decimal, currency: string = 'JPY'): MonetaryAmount {
  return {
    amount: decimal.toNumber(),
    currency
  }
}

/**
 * 数値をMonetaryAmountに変換
 */
function numberToMonetaryAmount(amount: number, currency: string = 'JPY'): MonetaryAmount {
  return {
    amount,
    currency
  }
}

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
  const amount = dbItem.amount ?? {
    amount: dbItem.quantity * dbItem.unitPrice.amount,
    currency: dbItem.unitPrice.currency
  };

  const taxAmount = numberToMonetaryAmount(
    (amount.amount * dbItem.taxRate) / 100,
    amount.currency
  );

  return {
    id: dbItem.id,
    invoiceId: dbItem.invoiceId,
    itemName: dbItem.itemName,
    description: dbItem.description ?? null,
    quantity: dbItem.quantity,
    unitPrice: dbItem.unitPrice,
    taxRate: dbItem.taxRate,
    amount,
    taxAmount: taxAmount.amount.toFixed(2),
    taxableAmount: amount.amount.toFixed(2),
    category: dbItem.category
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
  const defaultCurrency = form.items[0]?.unitPrice.currency ?? 'JPY';

  // 合計金額の計算
  const totalAmountValue = form.items.reduce((sum, item) => {
    return sum + (item.quantity * item.unitPrice.amount);
  }, 0);
  const totalAmount = numberToMonetaryAmount(totalAmountValue, defaultCurrency);

  // 税額の計算
  const taxAmountValue = form.items.reduce((sum, item) => {
    const itemAmount = item.quantity * item.unitPrice.amount;
    return sum + (itemAmount * item.taxRate / 100);
  }, 0);
  const taxAmount = numberToMonetaryAmount(taxAmountValue, defaultCurrency);

  // 税計算サマリーの生成
  const taxSummary = calculateTaxSummary(form.items);

  return {
    invoiceNumber: generateInvoiceNumber(),
    status: form.status,
    issueDate: form.issueDate,
    dueDate: form.dueDate,
    notes: form.notes,
    bankInfo: bankInfoToJson(form.bankInfo),
    vendorId: form.vendorId,
    purchaseOrderId: form.purchaseOrderId,
    items: {
      create: form.items.map(item => {
        const unitPrice = item.unitPrice;
        return {
          itemName: item.itemName,
          description: item.description,
          quantity: item.quantity,
          unitPrice,  // MonetaryAmount型として直接使用
          taxRate: item.taxRate,
          category: item.category,
          amount: numberToMonetaryAmount(
            item.quantity * item.unitPrice.amount,
            item.unitPrice.currency
          )
        };
      })
    },
    tags: form.tags.length > 0 ? {
      connect: form.tags.map(tag => ({ id: tag.id }))
    } : undefined,
    totalAmount: monetaryAmountToDecimal(totalAmount),
    taxAmount: monetaryAmountToDecimal(taxAmount),
    taxSummary: taxSummaryToJson(taxSummary),
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
    const amount = item.quantity * item.unitPrice.amount
    const taxAmount = (amount * item.taxRate) / 100
    const currency = item.unitPrice.currency

    if (!acc[taxRate]) {
      acc[taxRate] = {
        taxRate: item.taxRate,
        taxableAmount: numberToMonetaryAmount(amount, currency),
        taxAmount: numberToMonetaryAmount(taxAmount, currency)
      }
    } else {
      acc[taxRate].taxableAmount.amount += amount
      acc[taxRate].taxAmount.amount += taxAmount
    }

    return acc
  }, {} as Record<string, {
    taxRate: number;
    taxableAmount: MonetaryAmount;
    taxAmount: MonetaryAmount
  }>)

  const defaultCurrency = Object.values(summary)[0]?.taxableAmount.currency ?? 'JPY'

  return {
    byRate: summary,
    total: {
      taxableAmount: numberToMonetaryAmount(
        Object.values(summary).reduce((sum, { taxableAmount }) => sum + taxableAmount.amount, 0),
        defaultCurrency
      ),
      taxAmount: numberToMonetaryAmount(
        Object.values(summary).reduce((sum, { taxAmount }) => sum + taxAmount.amount, 0),
        defaultCurrency
      )
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