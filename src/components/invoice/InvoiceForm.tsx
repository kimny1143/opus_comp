'use client'

import { useState, useMemo } from 'react';
import {
  BankInfo,
  InvoiceItem,
  InvoiceStatus,
  InvoiceCreateInput,
  InvoiceTemplate,
  Invoice,
  InvoiceTemplateItem
} from '@/types/invoice';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { InvoiceItemForm } from './InvoiceItemForm';
import { PDFDownloadLink, BlobProvider } from '@react-pdf/renderer';
import { InvoicePDF } from './InvoicePDF';
import { InvoicePreview } from './InvoicePreview';
import { InvoiceEmailDialog } from './InvoiceEmailDialog';
import { InvoiceTemplateDialog } from './InvoiceTemplateDialog';
import { Prisma } from '@prisma/client';

interface InvoiceFormProps {
  initialData: Partial<InvoiceCreateInput & {
    contractorName?: string
    contractorAddress?: string
    registrationNumber?: string
  }>
  onSubmit: (data: InvoiceCreateInput) => Promise<void>
  isSubmitting: boolean
}

interface InvoiceFormData {
  vendorId: string
  purchaseOrderId?: string
  status: InvoiceStatus
  issueDate: Date
  dueDate: Date
  items: InvoiceItem[]
  notes: string
  bankInfo: BankInfo
  paymentTerms: string
  contractorName: string
  contractorAddress: string
  registrationNumber: string
}

const defaultFormData: InvoiceFormData = {
  vendorId: '',
  status: 'DRAFT',
  issueDate: new Date(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  items: [],
  notes: '',
  bankInfo: {
    bankName: '',
    branchName: '',
    accountType: 'ordinary',
    accountNumber: '',
    accountHolder: ''
  },
  contractorName: '',
  contractorAddress: '',
  registrationNumber: '',
  paymentTerms: '請求書発行から30日以内'
}

const calculateTotals = (items: InvoiceItem[]) => {
  const subTotal = items.reduce((sum, item) => {
    const amount = Number(item.unitPrice) * item.quantity
    return sum + amount
  }, 0)
  
  const taxTotal = items.reduce((sum, item) => {
    const amount = Number(item.unitPrice) * item.quantity
    return sum + (amount * Number(item.taxRate) / 100)
  }, 0)
  
  return { subTotal, taxTotal, total: subTotal + taxTotal }
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<InvoiceFormData>({
    ...defaultFormData,
    ...initialData,
    bankInfo: {
      ...defaultFormData.bankInfo,
      ...initialData?.bankInfo
    }
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    if (name.startsWith('bank.')) {
      const bankField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        bankInfo: {
          ...prev.bankInfo,
          [bankField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const invoiceData: InvoiceCreateInput = {
      vendorId: formData.vendorId,
      purchaseOrderId: formData.purchaseOrderId,
      status: formData.status,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      items: formData.items,
      notes: formData.notes,
      bankInfo: formData.bankInfo,
      paymentTerms: formData.paymentTerms
    }

    await onSubmit(invoiceData)
  }

  const handleItemsChange = (items: InvoiceItem[]) => {
    setFormData(prev => ({
      ...prev,
      items
    }))
  }

  const handleTemplateSelect = (template: InvoiceTemplate) => {
    const updatedFormData: InvoiceFormData = {
      vendorId: formData.vendorId,
      purchaseOrderId: formData.purchaseOrderId,
      status: formData.status,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      items: formData.items,
      notes: formData.notes,
      bankInfo: template.bankInfo,
      paymentTerms: template.paymentTerms || formData.paymentTerms,
      contractorName: template.contractorName,
      contractorAddress: template.contractorAddress,
      registrationNumber: template.registrationNumber
    }
    setFormData(updatedFormData)

    if (template.defaultItems?.length) {
      const newItems: InvoiceItem[] = template.defaultItems.map(item => {
        // itemName フィールドが必須なので、template でも同名を想定
        return {
          itemName: item.itemName || '商品名未設定',
          quantity: new Prisma.Decimal(String(item.quantity)).toNumber(),
          unitPrice: new Prisma.Decimal(String(item.unitPrice)),
          taxRate: new Prisma.Decimal(String(item.taxRate)),
          description: item.description || null
        }
      })

      setFormData(prev => ({
        ...prev,
        items: newItems
      }))
    }
  }

  // プレビュー用のデータ変換
  const createPreviewData = (data: InvoiceCreateInput): Invoice => {
    return {
      id: 'preview',
      invoiceNumber: `PREVIEW-${Date.now()}`,
      vendorId: data.vendorId,
      purchaseOrderId: data.purchaseOrderId || '',
      templateId: 'preview-template',
      status: data.status,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      totalAmount: new Prisma.Decimal(0),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: 'system',
      updatedById: null,
      vendor: {
        id: data.vendorId,
        name: 'プレビュー用引先',
        email: 'preview@example.com',
        category: 'CORPORATION',
        status: 'ACTIVE',
        address: 'プレビュー用住所',
        phone: '00-0000-0000',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: 'system',
        updatedById: null,
        businessType: null,
        code: null,
        contactPerson: null,
        registrationNumber: null,
        tradingName: null
      },
      items: data.items,
      bankInfo: data.bankInfo,
      notes: data.notes,
      template: {
        id: crypto.randomUUID(),
        bankInfo: data.bankInfo,
        contractorName: formData.contractorName || 'プレビュー用事業者',
        contractorAddress: formData.contractorAddress || 'プレビュー用住所',
        registrationNumber: formData.registrationNumber || 'T0000000000000',
        paymentTerms: formData.paymentTerms
      }
    }
  }

  // 現在の請求書データをメモ化
  const currentInvoice = useMemo(() => {
    return {
      vendorId: formData.vendorId,
      purchaseOrderId: formData.purchaseOrderId,
      status: formData.status,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      items: formData.items,
      notes: formData.notes,
      bankInfo: formData.bankInfo,
      paymentTerms: formData.paymentTerms
    } as InvoiceCreateInput
  }, [formData])

  // プレビューのデータを作成
  const previewData = useMemo(() => createPreviewData(currentInvoice), [currentInvoice, formData])

  // BlobProviderの型義
  interface RenderProps {
    blob: Blob | null
    url: string | null
    loading: boolean
    error: Error | null
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* フリランス情報セクション */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium">事業者情報</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contractorName">事業者名 *</Label>
            <Input
              id="contractorName"
              name="contractorName"
              value={formData.contractorName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="registrationNumber">登録番号 *</Label>
            <Input
              id="registrationNumber"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              placeholder="T1234567890123"
              required
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="contractorAddress">事業者所 *</Label>
            <Input
              id="contractorAddress"
              name="contractorAddress"
              value={formData.contractorAddress}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
      </div>

      {/* 銀行情報セクション */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium">振込先情報</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bank.bankName">銀行名 *</Label>
            <Input
              id="bank.bankName"
              name="bank.bankName"
              value={formData.bankInfo.bankName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="bank.branchName">支店名 *</Label>
            <Input
              id="bank.branchName"
              name="bank.branchName"
              value={formData.bankInfo.branchName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="bank.accountType">口座種別 *</Label>
            <select
              id="bank.accountType"
              name="bank.accountType"
              value={formData.bankInfo.accountType}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2"
              required
            >
              <option value="ordinary">普通</option>
              <option value="current">当座</option>
            </select>
          </div>
          <div>
            <Label htmlFor="bank.accountNumber">口座番号 *</Label>
            <Input
              id="bank.accountNumber"
              name="bank.accountNumber"
              value={formData.bankInfo.accountNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="bank.accountHolder">口座名義 *</Label>
            <Input
              id="bank.accountHolder"
              name="bank.accountHolder"
              value={formData.bankInfo.accountHolder}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
      </div>

      {/* 請求項目セクション */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">請求項目</h3>
        <InvoiceItemForm
          items={formData.items}
          onChange={handleItemsChange}
        />
      </div>

      {/* 合計金額表示 */}
      <div className="pt-4 border-t">
        <div className="flex justify-end space-y-2">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span>小計:</span>
              <span>{calculateTotals(formData.items).subTotal.toLocaleString()}円</span>
            </div>
            <div className="flex justify-between">
              <span>消費税:</span>
              <span>{calculateTotals(formData.items).taxTotal.toLocaleString()}円</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>合計:</span>
              <span>{calculateTotals(formData.items).total.toLocaleString()}円</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSubmit({ ...currentInvoice, status: 'DRAFT' })}
          disabled={isSubmitting}
        >
          下書き保存
        </Button>
        <InvoicePreview invoice={previewData} />
        <InvoiceEmailDialog invoice={previewData} />
        <BlobProvider document={<InvoicePDF invoice={previewData} />}>
          {({ blob, url, loading }: RenderProps) => (
            <a
              href={url || '#'}
              download={`請求書_${previewData.invoiceNumber}.pdf`}
              className={`px-4 py-2 rounded-md ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
              onClick={(e) => {
                if (loading || !url) {
                  e.preventDefault();
                }
              }}
            >
              {loading ? 'PDF生成中...' : 'PDF出力'}
            </a>
          )}
        </BlobProvider>
        <InvoiceTemplateDialog
          currentData={{
            contractorName: formData.contractorName,
            contractorAddress: formData.contractorAddress,
            registrationNumber: formData.registrationNumber,
            bankInfo: formData.bankInfo,
            paymentTerms: initialData?.paymentTerms || '請求書発行から30日以内',
            notes: initialData?.notes || ''
          }}
          onSaveTemplate={async (template) => {
            const response = await fetch('/api/invoice/templates', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(template)
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
          }}
          onLoadTemplate={(template) => {
            setFormData((prev) => ({
              ...prev,
              contractorName: template.contractorName,
              contractorAddress: template.contractorAddress,
              registrationNumber: template.registrationNumber,
              bankInfo: template.bankInfo,
            }));

            if (template.defaultItems?.length) {
              const newItems: InvoiceItem[] = template.defaultItems.map(item => ({
                itemName: item.itemName,
                quantity: item.quantity,
                unitPrice: new Prisma.Decimal(String(item.unitPrice)),
                taxRate: new Prisma.Decimal(String(item.taxRate)),
                description: item.description || null
              }));
              handleItemsChange(newItems);
            }
          }}
        />
        <Button
          type="submit"
          variant="default"
          disabled={isSubmitting}
        >
          {isSubmitting ? '処理中...' : '請求書発行'}
        </Button>
      </div>
    </form>
  );
}; 