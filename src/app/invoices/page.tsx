import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { InvoiceListWrapper } from '@/components/invoice/InvoiceListWrapper'
import { redirect } from 'next/navigation'
import { serializeDecimal } from '@/lib/utils/decimal-serializer'
import { PurchaseOrderStatus, InvoiceStatus } from '@prisma/client'
import { unstable_noStore as noStore } from 'next/cache'
import { ExtendedInvoice, SerializedInvoice } from '@/types/invoice'
import { SerializedPurchaseOrder } from '@/types/purchase-order'
import { calculateTaxSummary } from '@/domains/invoice/tax'
import { BankInfo, AccountType, bankInfoFromPrismaJson } from '@/types/bankAccount'
import { Prisma } from '@prisma/client'
import { TagFormData } from '@/types/tag'

// メタデータの設定
export const metadata = {
  title: '請求書一覧 - OPUS',
  description: '請求書の一覧を表示し、管理することができます。',
}

const defaultBankInfo: BankInfo = {
  bankName: '',
  branchName: '',
  accountType: AccountType.ORDINARY,
  accountNumber: '',
  accountHolder: ''
};

export default async function InvoicesPage() {
  noStore()
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/signin')
  }

  // 請求書が作成されていない発注書のIDを取得
  const existingPurchaseOrderIds = await prisma.invoice
    .findMany({
      select: {
        purchaseOrderId: true
      }
    })
    .then(invoices => invoices
      .map(i => i.purchaseOrderId)
      .filter((id): id is string => id !== null)
    );

  // 請求書が作成されていない完了済み発注書を取得
  const completedPurchaseOrders = await prisma.purchaseOrder
    .findMany({
      where: {
        id: {
          notIn: existingPurchaseOrderIds
        },
        status: PurchaseOrderStatus.COMPLETED
      },
      include: {
        vendor: true,
        items: true,
        statusHistory: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

  // 既存の請求書と関連データを取得
  const rawInvoices = await prisma.invoice.findMany({
    include: {
      vendor: true,
      purchaseOrder: {
        include: {
          items: true,
          vendor: true
        }
      },
      template: true,
      items: true,
      tags: true,
      statusHistory: {
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // 請求書データの変換
  const invoices = rawInvoices.map(invoice => {
    const items = invoice.items.map(item => ({
      ...item,
      unitPrice: new Prisma.Decimal(item.unitPrice.toString()),
      taxRate: new Prisma.Decimal(item.taxRate.toString())
    }));

    const taxSummary = calculateTaxSummary(
      items.map(item => ({
        unitPrice: new Prisma.Decimal(item.unitPrice),
        quantity: item.quantity,
        taxRate: Number(item.taxRate)
      }))
    );

    const totalAmount = new Prisma.Decimal(invoice.totalAmount.toString());
    const taxableAmount = new Prisma.Decimal(taxSummary.totalTaxableAmount);
    const taxAmount = new Prisma.Decimal(taxSummary.totalTaxAmount);
    const total = taxableAmount.add(taxAmount);

    const bankInfo = (invoice.bankInfo ? bankInfoFromPrismaJson(invoice.bankInfo) : defaultBankInfo) as BankInfo;
    const template = invoice.template ? {
      ...invoice.template,
      bankInfo: (invoice.template.bankInfo ? bankInfoFromPrismaJson(invoice.template.bankInfo) : defaultBankInfo) as BankInfo
    } : null;

    const tags = (invoice.tags || []) as TagFormData[];

    const statusHistory = invoice.statusHistory.map(history => ({
      id: history.id,
      status: history.status as InvoiceStatus,
      createdAt: history.createdAt,
      user: history.user
    }));

    const extendedInvoice: Partial<ExtendedInvoice> = {
      ...invoice,
      items: invoice.items.map(item => ({
        ...item,
        unitPrice: new Prisma.Decimal(item.unitPrice),
        taxRate: new Prisma.Decimal(item.taxRate)
      })),
      createdAt: new Date(invoice.createdAt),
      updatedAt: new Date(invoice.updatedAt),
      issueDate: invoice.issueDate ? new Date(invoice.issueDate) : null,
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
      tags,
      taxAmount: new Prisma.Decimal(0),
      total: new Prisma.Decimal(0),
      statusHistory: [],
      template,
      bankInfo,
      vendor: invoice.vendor,
      purchaseOrder: null
    }

    const serializedInvoice: Partial<SerializedInvoice> = {
      ...extendedInvoice,
      createdAt: extendedInvoice.createdAt?.toISOString(),
      updatedAt: extendedInvoice.updatedAt?.toISOString(),
      issueDate: extendedInvoice.issueDate?.toISOString() || null,
      dueDate: extendedInvoice.dueDate?.toISOString() || null,
      items: extendedInvoice.items?.map(item => ({
        ...item,
        unitPrice: item.unitPrice.toString(),
        taxRate: item.taxRate.toString()
      })),
      totalAmount: extendedInvoice.totalAmount?.toString(),
      taxAmount: extendedInvoice.taxAmount?.toString(),
      total: extendedInvoice.total?.toString(),
      tags,
      bankInfo
    }

    return serializedInvoice as SerializedInvoice
  });

  // 発注書データの変換
  const serializedPurchaseOrders = completedPurchaseOrders.map(order => {
    const items = order.items.map(item => ({
      ...item,
      unitPrice: item.unitPrice.toString(),
      taxRate: item.taxRate.toString(),
      amount: item.amount?.toString() ?? null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }));

    const serialized: SerializedPurchaseOrder = {
      ...order,
      items,
      totalAmount: order.totalAmount.toString(),
      taxAmount: order.taxAmount?.toString() ?? null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    };

    return serialized;
  });

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">請求書一覧</h1>
      <InvoiceListWrapper 
        invoices={invoices}
        completedPurchaseOrders={serializedPurchaseOrders}
      />
    </div>
  );
}
