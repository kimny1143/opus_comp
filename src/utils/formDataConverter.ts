import { ExtendedInvoice, InvoiceFormItem } from '@/types/invoice'
import { InvoiceFormData } from '@/components/shared/form/schemas/invoiceSchema'
import { 
  BankInfo, 
  BankInfoOptional, 
  bankInfoSchema, 
  bankInfoToPrismaJson, 
  bankInfoFromPrismaJson,
  AccountType
} from '@/types/bankAccount'
import { Prisma, InvoiceStatus } from '@prisma/client'
import { TagFormData } from '@/types/tag'
import { parse } from 'date-fns'
import { Item } from '@/components/shared/form/schemas/commonSchema'

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
    itemName: item.itemName || '',
    quantity: item.quantity || 1,
    unitPrice: Number(item.unitPrice),
    taxRate: Number(item.taxRate),
    description: item.description || ''
  } satisfies InvoiceFormItem)) || []

  const bankInfoResult = bankInfoSchema.safeParse(data.bankInfo)
  const bankInfo = bankInfoResult.success ? bankInfoResult.data : null

  return {
    issueDate: data.issueDate || new Date(),
    dueDate: data.dueDate || new Date(),
    items,
    bankInfo: bankInfo || {
      bankName: '',
      branchName: '',
      accountType: AccountType.ORDINARY,
      accountNumber: '',
      accountHolder: ''
    },
    status: data.status,
    vendorId: data.vendorId,
    notes: data.description,
    purchaseOrderId: data.purchaseOrderId,
    tags: data.tags || [],
    registrationNumber: `T${data.invoiceNumber || '0000000000000'}`
  }
}

/**
 * 発注書データから請求書フォームデータを生成
 */
export function convertFromPurchaseOrder(purchaseOrder: any): Partial<InvoiceFormData> {
  const defaultBankInfo: BankInfoOptional = {
    bankName: '',
    branchName: '',
    accountType: AccountType.ORDINARY,
    accountNumber: '',
    accountHolder: ''
  }

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
      unitPrice: item.unitPrice,
      taxRate: Number((item.taxRate / 100).toFixed(2)),
      description: item.description
    })) || [],
    bankInfo,
    notes: purchaseOrder.notes || ''
  }
}

/**
 * フォームデータをPrisma用に変換
 */
export const convertToPrismaFormat = (formData: InvoiceFormData): Partial<ExtendedInvoice> => {
  const { items, bankInfo, tags, notes, registrationNumber, ...rest } = formData

  const validatedBankInfo: BankInfoOptional = {
    bankName: bankInfo.bankName || '',
    branchName: bankInfo.branchName || '',
    accountType: bankInfo.accountType as AccountType || AccountType.ORDINARY,
    accountNumber: bankInfo.accountNumber || '',
    accountHolder: bankInfo.accountHolder || ''
  }

  return {
    ...rest,
    status: rest.status as InvoiceStatus,
    issueDate: new Date(rest.issueDate),
    dueDate: new Date(rest.dueDate),
    items: items.map(item => ({
      itemName: String(item.itemName || ''),
      quantity: Number(item.quantity || 0),
      unitPrice: new Prisma.Decimal(String(item.unitPrice || 0)),
      taxRate: new Prisma.Decimal(String(Number(item.taxRate || 0) / 100)),
      description: item.description ? String(item.description) : undefined
    })),
    bankInfo: bankInfoToPrismaJson(validatedBankInfo),
    description: notes,
    invoiceNumber: registrationNumber.replace(/^T/, ''),
    tags: tags?.map((tag): TagFormData => ({
      id: tag.id || '',
      name: tag.name
    }))
  }
}

// APIレスポンスをフォーム用に変換
export const convertToFormFormat = (data: Partial<ExtendedInvoice>): InvoiceFormData => {
  const { items, bankInfo, tags, ...rest } = data

  // bankInfoの変換
  const defaultBankInfo: BankInfoOptional = {
    bankName: '',
    branchName: '',
    accountType: AccountType.ORDINARY,
    accountNumber: '',
    accountHolder: ''
  }

  let parsedBankInfo: BankInfoOptional
  try {
    parsedBankInfo = bankInfoFromPrismaJson(bankInfo) || defaultBankInfo
  } catch (error) {
    console.error('Failed to parse bank info:', error)
    parsedBankInfo = defaultBankInfo
  }

  // tagsの変換
  const convertedTags: TagFormData[] = tags?.map(tag => ({
    id: tag.id,
    name: tag.name
  } satisfies TagFormData)) ?? []

  return {
    ...rest,
    issueDate: rest.issueDate ? new Date(rest.issueDate) : new Date(),
    dueDate: rest.dueDate ? new Date(rest.dueDate) : new Date(),
    items: items?.map(item => ({
      id: item.id,
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      taxRate: Number(item.taxRate),
      description: item.description
    })) ?? [],
    bankInfo: parsedBankInfo,
    tags: convertedTags
  }
}

// 新規作成時のデフォルト値
export const getDefaultInvoiceData = (): InvoiceFormData => ({
  issueDate: new Date(),
  dueDate: new Date(),
  items: [],
  bankInfo: {
    bankName: '',
    branchName: '',
    accountType: AccountType.ORDINARY,
    accountNumber: '',
    accountHolder: ''
  } satisfies BankInfoOptional,
  status: InvoiceStatus.DRAFT,
  tags: []
})

interface RawTagData {
  id?: string
  name: string
}

interface RawBankInfoData {
  bankName: string
  branchName: string
  accountType: 'ORDINARY' | 'CURRENT' | 'SAVINGS'
  accountNumber: string
  accountHolder: string
}

interface RawBankInfoInput {
  bankName: string
  branchName: string
  accountType: 'ORDINARY' | 'CURRENT' | 'SAVINGS'
  accountNumber: string
  accountHolder: string
}

// 日付文字列をDate型に変換する関数
const parseDate = (dateStr: string): Date => {
  try {
    // ISO形式の日付文字列の場合
    if (dateStr.includes('T')) {
      return new Date(dateStr)
    }
    // YYYY-MM-DD形式の場合
    return parse(dateStr, 'yyyy-MM-dd', new Date())
  } catch (error) {
    throw new Error(`Invalid date format: ${dateStr}`)
  }
}

// 銀行情報を検証する関数
const validateBankInfo = (data: unknown): data is BankInfoOptional => {
  if (!data || typeof data !== 'object') return false
  const bankInfo = data as Record<string, unknown>
  return (
    typeof bankInfo.bankName === 'string' &&
    typeof bankInfo.branchName === 'string' &&
    typeof bankInfo.accountType === 'string' &&
    ['ORDINARY', 'CURRENT', 'SAVINGS'].includes(bankInfo.accountType as string) &&
    typeof bankInfo.accountNumber === 'string' &&
    typeof bankInfo.accountHolder === 'string'
  )
}

// 銀行情報を変換する関数
const convertToBankInfo = (data: unknown): BankInfoOptional => {
  if (!data || typeof data !== 'object') {
    throw new Error('銀行情報が不正です')
  }

  const bankInfo = data as Record<string, unknown>
  if (!validateBankInfo(bankInfo)) {
    throw new Error('銀行情報の形式が不正です')
  }

  return {
    bankName: bankInfo.bankName as string,
    branchName: bankInfo.branchName as string,
    accountType: bankInfo.accountType as AccountType,
    accountNumber: bankInfo.accountNumber as string,
    accountHolder: bankInfo.accountHolder as string
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

// フォームデータを変換する関数
export const convertFormDataToInvoice = (formData: any) => {
  // bankInfoの必須フィールドを確認と変換
  if (!formData.bankInfo || typeof formData.bankInfo !== 'object') {
    throw new Error('Bank info is required and must be an object')
  }

  const bankInfo = convertToBankInfo(formData.bankInfo)

  // tagsの型を保証
  const tags = Array.isArray(formData.tags) 
    ? formData.tags.map(convertToTagFormData)
    : []

  return {
    ...formData,
    issueDate: formData.issueDate ? parseDate(formData.issueDate) : undefined,
    dueDate: formData.dueDate ? parseDate(formData.dueDate) : undefined,
    bankInfo,
    tags
  }
}

// APIレスポンスを変換する関数
export const convertApiResponseToFormData = (data: any) => {
  // bankInfoの変換
  let bankInfo: BankInfoOptional | undefined = undefined
  if (data.bankInfo) {
    try {
      const bankInfoJson = typeof data.bankInfo === 'string' 
        ? JSON.parse(data.bankInfo) 
        : data.bankInfo

      const bankInfoInput = {
        bankName: String(bankInfoJson.bankName || '').trim(),
        branchName: String(bankInfoJson.branchName || '').trim(),
        accountType: bankInfoJson.accountType || AccountType.ORDINARY,
        accountNumber: String(bankInfoJson.accountNumber || '').trim(),
        accountHolder: String(bankInfoJson.accountHolder || '').trim()
      } satisfies BankInfoOptional

      const bankInfoResult = bankInfoSchema.safeParse(bankInfoInput)
      if (bankInfoResult.success) {
        bankInfo = bankInfoResult.data
      }
    } catch (error) {
      console.error('Failed to parse bank info:', error)
    }
  }

  // tagsの型を保証
  const tags: TagFormData[] = Array.isArray(data.tags) 
    ? data.tags.map((tag: any): TagFormData => {
        if (!tag?.name) {
          throw new Error('Tag name is required')
        }
        return {
          id: tag.id || '',
          name: String(tag.name).trim()
        }
      })
    : []

  return {
    ...data,
    issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    bankInfo,
    tags
  }
} 