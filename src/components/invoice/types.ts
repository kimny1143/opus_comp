import { InvoiceItem } from '@/types/invoice';

export interface InvoiceTemplate {
  id?: string;
  name: string;
  contractorName: string;
  contractorAddress: string;
  registrationNumber: string;
  bankInfo: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };
  paymentTerms?: string;
  notes?: string;
  defaultItems?: Omit<InvoiceItem, 'id' | 'invoiceId'>[];
}

export interface InvoiceTemplateDialogProps {
  currentData: Omit<InvoiceTemplate, 'id' | 'name'>;
  onSaveTemplate: (template: InvoiceTemplate) => Promise<void>;
  onLoadTemplate: (template: InvoiceTemplate) => void;
} 