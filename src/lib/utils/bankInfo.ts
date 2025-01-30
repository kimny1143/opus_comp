import { BankInfo, ACCOUNT_TYPE_LABELS } from '@/types/bankAccount'

/**
 * 銀行情報を文字列に変換する
 */
export const convertBankInfoToString = (bankInfo: BankInfo): {
  bankName: string
  branchName: string
  accountType: string
  accountNumber: string
  accountHolder: string
} => {
  return {
    bankName: String(bankInfo.bankName),
    branchName: String(bankInfo.branchName),
    accountType: ACCOUNT_TYPE_LABELS[bankInfo.accountType],
    accountNumber: String(bankInfo.accountNumber),
    accountHolder: String(bankInfo.accountHolder)
  }
}

/**
 * 銀行情報を表示用の文字列にフォーマットする
 */
export const formatBankInfo = (bankInfo: BankInfo): string => {
  const info = convertBankInfoToString(bankInfo)
  return `
銀行名：${info.bankName}
支店名：${info.branchName}
口座種別：${info.accountType}
口座番号：${info.accountNumber}
口座名義：${info.accountHolder}
`.trim()
} 