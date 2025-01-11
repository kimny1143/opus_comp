import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/prisma';
import { InvoiceListWrapper } from '@/components/invoice/InvoiceListWrapper';
import { redirect } from 'next/navigation';
import { serializeDecimal } from '@/lib/utils/decimal-serializer';
import { BankInfo, ExtendedInvoice } from '@/types/invoice';

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/signin');
  }

  // 完了済みの発注書を取得
  const completedPurchaseOrders = await prisma.purchaseOrder.findMany({
    where: {
      status: 'COMPLETED',
      invoices: {
        none: {}
      }
    },
    include: {
      vendor: true
    }
  });

  const serializedCompletedPurchaseOrders = completedPurchaseOrders.map(order => ({
    ...serializeDecimal(order),
    vendor: order.vendor
  }));

  const rawInvoices = await prisma.invoice.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      vendor: true,
      purchaseOrder: {
        include: {
          vendor: true
        }
      },
      items: true,
      template: true,
      statusHistory: {
        include: {
          user: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  const defaultBankInfo: BankInfo = {
    bankName: '',
    branchName: '',
    accountType: 'ordinary',
    accountNumber: '',
    accountHolder: ''
  };

  const serializedInvoices = rawInvoices.map(invoice => {
    const serialized = serializeDecimal(invoice);
    const bankInfo = typeof serialized.template?.bankInfo === 'object' 
      ? serialized.template.bankInfo as BankInfo 
      : defaultBankInfo;

    const template = serialized.template ? {
      id: serialized.template.id,
      bankInfo: bankInfo,
      contractorName: serialized.template.contractorName,
      contractorAddress: serialized.template.contractorAddress,
      registrationNumber: serialized.template.registrationNumber,
      paymentTerms: serialized.template.paymentTerms
    } : {
      id: '',
      bankInfo: defaultBankInfo,
      contractorName: '',
      contractorAddress: '',
      registrationNumber: '',
      paymentTerms: ''
    };

    const result: ExtendedInvoice = {
      ...serialized,
      items: serialized.items.map(item => ({
        ...item,
        unitPrice: String(item.unitPrice),
        taxRate: String(item.taxRate)
      })),
      purchaseOrder: serialized.purchaseOrder ? {
        id: serialized.purchaseOrder.id,
        orderNumber: serialized.purchaseOrder.orderNumber,
        status: serialized.purchaseOrder.status,
        vendorId: serialized.purchaseOrder.vendorId,
        vendor: serialized.purchaseOrder.vendor ? {
          name: serialized.purchaseOrder.vendor.name,
          address: serialized.purchaseOrder.vendor.address
        } : undefined
      } : null,
      totalAmount: serialized.totalAmount,
      bankInfo,
      template,
      total: Number(serialized.totalAmount),
      taxAmount: Number(serialized.totalAmount) * 0.1, // 仮の計算
      vendor: serialized.vendor,
      notes: serialized.notes
    };

    return result;
  });

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <InvoiceListWrapper 
          invoices={serializedInvoices} 
          completedPurchaseOrders={serializedCompletedPurchaseOrders}
        />
      </Suspense>
    </div>
  );
}