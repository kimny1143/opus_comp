'use server';

import { prisma } from '@/lib/prisma';
import { InvoiceStatusType } from '@/domains/invoice/types';
import { revalidatePath } from 'next/cache';

export async function updateInvoiceStatus(
  invoiceId: string,
  newStatus: InvoiceStatusType
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { status: true }
    });

    if (!invoice) {
      return {
        error: true,
        message: '請求書が見つかりません',
        previousStatus: null
      };
    }

    const previousStatus = invoice.status;

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus }
    });

    // ステータス履歴を記録
    await prisma.statusHistory.create({
      data: {
        type: 'INVOICE',
        status: newStatus,
        invoiceId,
        userId: 'system', // TODO: 実際のユーザーIDを使用
        comment: `ステータスを ${previousStatus} から ${newStatus} に変更`
      }
    });

    revalidatePath('/invoices');

    return {
      error: false,
      previousStatus
    };
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return {
      error: true,
      message: 'ステータスの更新に失敗しました',
      previousStatus: null
    };
  }
}
