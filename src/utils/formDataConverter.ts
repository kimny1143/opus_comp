import { ExtendedInvoice, InvoiceItem } from '@/types/invoice'
import { InvoiceFormData } from '@/types/validation/invoice'
import { 
  BankInfo,
  BankInfoOptional,
  AccountType,
  bankInfoSchema,
  bankInfoToPrismaJson,
  bankInfoFromPrismaJson,
  defaultBankInfo
} from '@/types/bankAccount'
import { Prisma, InvoiceStatus } from '@prisma/client'
import { TagFormData } from '@/types/tag'
import { parse } from 'date-fns'
import { Item } from '@/components/shared/form/schemas/commonSchema'
import { monetaryToDecimal, decimalToMonetary } from './monetary'

// 銀行情報のシリアライズ/デシリアライズ関数
const serializeBankInfo = (info: BankInfo): Record<string, unknown> => {
  return {
    bankName: info.bankName,
    branchName: info.branchName,
    accountType: info.accountType,
    accountNumber: info.accountNumber,
    accountHolder: info.accountHolder
  }
}

const deserializeBankInfo = (json: unknown): BankInfo | null => {
  try {
    if (typeof json !== 'object' || json === null) return null
    const data = json as Record<string, unknown>
    
    if (!validateBankInfo(data)) return null
    if (!isAccountType(data.accountType)) return null

    return {
      bankName: String(data.bankName),
      branchName: String(data.branchName),
      accountType: data.accountType,
      accountNumber: String(data.accountNumber),
      accountHolder: String(data.accountHolder)
    }
  } catch {
    return null
  }
}

interface OrderItem {
  id?: string
  itemName: string
  quantity: number
  unitPrice: number
  taxRate: number
  description?: string
}

/**
 * APIレスポンスデータをフォームデータに変換
 */
export function convertToFormData(data: Partial<ExtendedInvoice>): Partial<InvoiceFormData> {
  const items = data.items?.map(item => ({
    id: item.id || '',
    itemName: item.itemName || '',
    quantity: item.quantity || 1,
    unitPrice: new Prisma.Decimal(String(item.unitPrice || 0)),
    taxRate: new Prisma.Decimal(String(item.taxRate || 0)),
    description: item.description || ''
  } satisfies InvoiceItem)) || []

  const bankInfoResult = bankInfoSchema.safeParse(data.bankInfo)
  const bankInfo = bankInfoResult.success ? bankInfoResult.data : defaultBankInfo

  return {
    issueDate: data.issueDate || new Date(),
    dueDate: data.dueDate || new Date(),
    items,
    bankInfo,
    status: data.status || InvoiceStatus.DRAFT,
    vendorId: data.vendorId || '',
    notes: data.description || '',
    purchaseOrderId: data.purchaseOrderId,
    tags: data.tags || [],
    registrationNumber: `T${data.invoiceNumber || '0000000000000'}`
  }
}

/**
 * 発注書データから請求書フォームデータを生成
 */
export function convertFromPurchaseOrder(purchaseOrder: any): Partial<InvoiceFormData> {
  const bankInfo = purchaseOrder.vendor?.bankInfo
    ? convertToBankInfo(purchaseOrder.vendor.bankInfo)
    : defaultBankInfo

  return {
    vendorId: purchaseOrder.vendor?.id || '',
    purchaseOrderId: purchaseOrder.id || '',
    status: InvoiceStatus.DRAFT,
    items: purchaseOrder.items?.map((item: any) => ({
      id: item.id,
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: new Prisma.Decimal(String(item.unitPrice || 0)),
      taxRate: new Prisma.Decimal(String(Number(item.taxRate || 0) / 100)),
      description: item.description
    })) || [],
    bankInfo,
    notes: purchaseOrder.notes || ''
  }
}

/**
 * フォームデータをPrisma用に変換
 */
export const convertToPrismaFormat = (formData: InvoiceFormData): Partial<Omit<ExtendedInvoice, 'bankInfo'> & { bankInfo: Prisma.JsonValue }> => {
  const { items, bankInfo, tags, notes, registrationNumber, ...rest } = formData

  const validatedBankInfo = convertToBankInfo({
    bankName: bankInfo.bankName,
    branchName: bankInfo.branchName,
    accountType: bankInfo.accountType,
    accountNumber: bankInfo.accountNumber,
    accountHolder: bankInfo.accountHolder
  })

  return {
    ...rest,
    status: rest.status as InvoiceStatus,
    issueDate: new Date(rest.issueDate),
    dueDate: new Date(rest.dueDate),
    items: items.map(item => ({
      id: item.id,
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: new Prisma.Decimal(String(item.unitPrice)),
      taxRate: new Prisma.Decimal(String(item.taxRate)),
      description: item.description
    })),
    bankInfo: serializeBankInfo(validatedBankInfo) as unknown as Prisma.JsonValue,
    description: notes,
    invoiceNumber: registrationNumber.replace(/^T/, ''),
    tags: tags?.map((tag): TagFormData => ({
      id: tag.id,
      name: tag.name
    }))
  }
}

// APIレスポンスをフォーム用に変換
export const convertToFormFormat = (data: Partial<Omit<ExtendedInvoice, 'bankInfo'>> & { bankInfo?: Prisma.JsonValue }): InvoiceFormData => {
  const { items, bankInfo, tags, ...rest } = data

  const parsedBankInfo = (() => {
    if (!bankInfo || bankInfo === null) return defaultBankInfo
    try {
      const parsed = typeof bankInfo === 'string' ? JSON.parse(bankInfo) : bankInfo
      const bankInfoResult = bankInfoSchema.safeParse(parsed)
      if (!bankInfoResult.success) return defaultBankInfo
      return bankInfoResult.data
    } catch (error) {
      console.error('Failed to parse bank info:', error)
      return defaultBankInfo
    }
  })()

  const convertedTags: TagFormData[] = tags?.map(tag => ({
    id: tag.id,
    name: tag.name
  })) ?? []

  const status = rest.status || InvoiceStatus.DRAFT

  return {
    ...rest,
    status,
    issueDate: rest.issueDate ? new Date(rest.issueDate) : new Date(),
    dueDate: rest.dueDate ? new Date(rest.dueDate) : new Date(),
    items: items?.map(item => ({
      id: item.id || '',
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: new Prisma.Decimal(String(item.unitPrice)),
      taxRate: new Prisma.Decimal(String(item.taxRate)),
      description: item.description || ''
    })) ?? [],
    bankInfo: parsedBankInfo,
    tags: convertedTags,
    vendorId: rest.vendorId || '',
    registrationNumber: rest.invoiceNumber ? `T${rest.invoiceNumber}` : '',
    notes: rest.description || '',
    allowExtendedTaxRates: false
  } as InvoiceFormData
}

// 新規作成時のデフォルト値
export const getDefaultInvoiceData = (): InvoiceFormData => ({
  issueDate: new Date(),
  dueDate: new Date(),
  items: [],
  bankInfo: defaultBankInfo,
  status: InvoiceStatus.DRAFT,
  tags: [],
  vendorId: '',
  registrationNumber: '',
  notes: '',
  allowExtendedTaxRates: false
})

// 日付文字列をDate型に変換する関数
const parseDate = (dateStr: string): Date => {
  try {
    if (dateStr.includes('T')) {
      return new Date(dateStr)
    }
    return parse(dateStr, 'yyyy-MM-dd', new Date())
  } catch (error) {
    throw new Error(`Invalid date format: ${dateStr}`)
  }
}

// 銀行情報を検証する関数
const isAccountType = (value: unknown): value is AccountType => {
  return typeof value === 'string' && Object.values(AccountType).includes(value as AccountType)
}

const validateBankInfo = (data: unknown): data is Record<string, unknown> => {
  if (!data || typeof data !== 'object') return false
  const bankInfo = data as Record<string, unknown>
  return (
    typeof bankInfo.bankName === 'string' &&
    typeof bankInfo.branchName === 'string' &&
    isAccountType(bankInfo.accountType) &&
    typeof bankInfo.accountNumber === 'string' &&
    typeof bankInfo.accountHolder === 'string'
  )
}

// 銀行情報を変換する関数
const convertToBankInfo = (data: unknown): BankInfo => {
  if (!data || typeof data !== 'object') {
    throw new Error('銀行情報が不正です')
  }

  const bankInfo = data as Record<string, unknown>
  if (!validateBankInfo(bankInfo)) {
    throw new Error('銀行情報の形式が不正です')
  }

  if (!isAccountType(bankInfo.accountType)) {
    throw new Error('口座種別が不正です')
  }

  return {
    bankName: String(bankInfo.bankName),
    branchName: String(bankInfo.branchName),
    accountType: bankInfo.accountType,
    accountNumber: String(bankInfo.accountNumber),
    accountHolder: String(bankInfo.accountHolder)
  }
}

// タグデータを検証する関数
const validateTagData = (tag: unknown): tag is { id?: string; name: string } => {
  if (typeof tag !== 'object' || tag === null) return false
  
  const tagData = tag as { id?: string; name?: string }
  if (typeof tagData.name !== 'string' || !tagData.name.trim()) return false
  if (tagData.id !== undefined && typeof tagData.id !== 'string') return false
  
  return true
}

// タグデータを変換する関数
const convertToTagFormData = (tag: unknown): TagFormData => {
  if (!validateTagData(tag)) {
    throw new Error('Invalid tag data')
  }

  return {
    id: tag.id ?? '',
    name: tag.name.trim()
  }
}