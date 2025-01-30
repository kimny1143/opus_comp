import { Prisma, InvoiceStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/lib/prisma';
import { generateInvoicePDF } from '@/infrastructure/pdf/invoice';
import { sendInvoiceEmail, SendInvoiceEmailParams } from '@/infrastructure/mail/invoice';
import { calculateTaxSummary } from './tax';
import type { TaxableItem } from './tax';
import { 
  QualifiedInvoice, 
  InvoiceStatusType, 
  InvoiceTemplate,
  QualifiedInvoiceItem,
  BankInfo,
  QualifiedVendor,
  InvoiceTaxSummary
} from './types';
import { InvoiceItem as PrismaInvoiceItem } from '@prisma/client';

const invoiceInclude = {
  vendor: true,
  items: true,
  template: true,
  purchaseOrder: {
    include: {
      vendor: true
    }
  }
} as const;

type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: typeof invoiceInclude;
}>;

export class InvoiceService {
  static async createInvoice(data: Prisma.InvoiceCreateInput): Promise<QualifiedInvoice> {
    const invoice = await prisma.invoice.create({
      data,
      include: invoiceInclude
    });

    return this.convertToQualifiedInvoice(invoice);
  }

  static async sendInvoice(invoiceId: string, emailData: {
    to: string;
    cc?: string;
    bcc?: string;
  }): Promise<void> {
    const invoice = await this.getInvoiceById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // PDFを生成
    const pdfBuffer = await generateInvoicePDF(invoice);

    // メールを送信
    const emailParams: SendInvoiceEmailParams = {
      invoice,
      pdfBuffer,
      ...emailData
    };
    await sendInvoiceEmail(emailParams);

    // ステータスを更新
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: InvoiceStatus.APPROVED }
    });
  }

  static async getInvoiceById(id: string): Promise<QualifiedInvoice | null> {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: invoiceInclude
    });

    if (!invoice || !invoice.template) return null;

    return this.convertToQualifiedInvoice(invoice);
  }

  static async getOverdueInvoices(): Promise<QualifiedInvoice[]> {
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: {
          in: [InvoiceStatus.APPROVED, InvoiceStatus.OVERDUE]
        },
        dueDate: {
          lt: new Date()
        }
      },
      include: invoiceInclude
    });

    return overdueInvoices
      .filter(invoice => invoice.template !== null)
      .map(invoice => this.convertToQualifiedInvoice(invoice));
  }

  private static convertToQualifiedInvoice(invoice: InvoiceWithRelations): QualifiedInvoice {
    if (!invoice.template) {
      throw new Error('Invoice template is required');
    }

    if (!invoice.vendor.registrationNumber || !invoice.vendor.address) {
      throw new Error('Vendor registration number and address are required');
    }

    const bankInfo = invoice.bankInfo as unknown as BankInfo;
    const templateBankInfo = invoice.template.bankInfo as unknown as BankInfo;

    const taxSummary = this.calculateInvoiceTax(invoice.items);

    const template: InvoiceTemplate = {
      id: invoice.template.id,
      bankInfo: templateBankInfo,
      contractorName: invoice.template.contractorName,
      contractorAddress: invoice.template.contractorAddress,
      registrationNumber: invoice.template.registrationNumber,
      paymentTerms: invoice.template.paymentTerms || undefined
    };

    const items: QualifiedInvoiceItem[] = invoice.items.map(item => ({
      id: item.id,
      invoiceId: item.invoiceId,
      itemName: item.itemName,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      taxRate: Number(item.taxRate),
      taxAmount: Number(item.unitPrice.toString()) * item.quantity * Number(item.taxRate) / 100,
      taxableAmount: Number(item.unitPrice.toString()) * item.quantity
    }));

    const vendor: QualifiedVendor = {
      id: invoice.vendor.id,
      name: invoice.vendor.name,
      registrationNumber: invoice.vendor.registrationNumber!,
      address: invoice.vendor.address!,
      tel: invoice.vendor.phone || undefined,
      email: invoice.vendor.email || undefined
    };

    const totalAmount = new Decimal(
      items.reduce((sum, item) => sum + item.taxableAmount + item.taxAmount, 0)
    );

    return {
      id: invoice.id,
      templateId: invoice.templateId,
      purchaseOrderId: invoice.purchaseOrderId,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status as InvoiceStatusType,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      notes: invoice.notes,
      bankInfo,
      vendor,
      template,
      issuer: {
        name: process.env.INVOICE_ISSUER_NAME!,
        registrationNumber: process.env.INVOICE_REGISTRATION_NUMBER!,
        address: process.env.INVOICE_ISSUER_ADDRESS!,
        tel: process.env.INVOICE_ISSUER_TEL,
        email: process.env.INVOICE_ISSUER_EMAIL
      },
      taxSummary,
      items,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      createdById: invoice.createdById,
      updatedById: invoice.updatedById,
      vendorId: invoice.vendor.id,
      totalAmount
    };
  }

  private static calculateInvoiceTax(items: PrismaInvoiceItem[]): InvoiceTaxSummary {
    const taxableItems: TaxableItem[] = items.map(item => ({
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      taxRate: Number(item.taxRate)
    }));
    return calculateTaxSummary(taxableItems);
  }
} 