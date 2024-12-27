import { Suspense } from 'react';
import { InvoiceList } from '@/components/invoice/InvoiceList';
import { prisma } from '@/lib/prisma';
import { Invoice, InvoiceStatus, BankInfo } from '@/types/invoice';
import { OrderStatus, mapPurchaseOrderStatusToOrderStatus } from '@/types/order-status';
import { Prisma } from '@prisma/client';

async function getInvoices(): Promise<Invoice[]> {
  const invoices = await prisma.invoice.findMany({
    include: {
      vendor: true,
      items: true,
      payment: true,
      template: true,
      purchaseOrder: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return invoices.map(invoice => {
    const defaultBankInfo: BankInfo = {
      bankName: '',
      branchName: '',
      accountType: 'ordinary',
      accountNumber: '',
      accountHolder: ''
    };

    return {
      id: invoice.id,
      invoiceNumber: invoice.id,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      purchaseOrderId: invoice.purchaseOrderId,
      purchaseOrder: invoice.purchaseOrder,
      status: invoice.status,
      vendor: invoice.vendor,
      vendorId: invoice.vendorId,
      template: {
        ...invoice.template,
        bankInfo: invoice.template?.bankInfo as BankInfo || defaultBankInfo,
        contractorName: invoice.vendor.name,
        contractorAddress: invoice.vendor.address || '',
        registrationNumber: invoice.vendor.registrationNumber || '',
        paymentTerms: invoice.template?.paymentTerms || '請求書発行から30日以内'
      },
      templateId: invoice.templateId,
      bankInfo: invoice.template?.bankInfo as BankInfo || defaultBankInfo,
      items: invoice.items.map(item => ({
        id: item.id,
        description: item.description || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        invoiceId: item.invoiceId,
        itemName: item.itemName
      })),
      totalAmount: invoice.totalAmount,
      taxAmount: Number(invoice.totalAmount.mul(new Prisma.Decimal(0.1))),
      notes: invoice.notes,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      createdById: invoice.createdById,
      updatedById: invoice.updatedById
    };
  });
}

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  const handleStatusChange = async (invoiceId: string, newStatus: InvoiceStatus) => {
    'use server';
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus as unknown as InvoiceStatus }
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <InvoiceList
          invoices={invoices}
          onStatusChange={handleStatusChange}
        />
      </Suspense>
    </div>
  );
} 