export enum AccountType {
  ORDINARY = 'ORDINARY',
  CURRENT = 'CURRENT',
  SAVINGS = 'SAVINGS'
}

export interface BankInfo {
  bankName: string;
  branchName: string;
  accountType: AccountType;
  accountNumber: string;
  accountHolder: string;
}

export type SerializedBankInfo = {
  bankName: string;
  branchName: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
}

export const serializeBankInfo = (bankInfo: BankInfo): SerializedBankInfo => ({
  ...bankInfo,
  accountType: bankInfo.accountType.toString()
});

export const deserializeBankInfo = (bankInfo: SerializedBankInfo): BankInfo => ({
  ...bankInfo,
  accountType: bankInfo.accountType as AccountType
}); 