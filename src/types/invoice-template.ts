import { Invoice } from './invoice';

export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  // テンプレートとして保存する請求書の基本情報
  contractorName: string;
  contractorAddress: string;
  registrationNumber: string;
  bankInfo: {
    bankName: string;
    branchName: string;
    accountType: 'ordinary' | 'current';
    accountNumber: string;
    accountHolder: string;
  };
  // 定型の請求項目（オプション）
  defaultItems?: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }[];
  // その他の設定
  paymentTerms: string;
  notes: string;
} 