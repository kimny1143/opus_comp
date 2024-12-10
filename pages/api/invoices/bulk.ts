import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { validationMessages as msg } from '@/lib/validations/messages';
import { Prisma, InvoiceStatusEnum } from '@prisma/client';
import { z } from 'zod';

// バリデーションスキーマ
const bulkActionSchema = z.object({
  action: z.enum(['delete', 'updateStatus']),
  invoiceIds: z.array(z.string()).min(1, '請求書を選択してください'),
  status: z.enum([
    InvoiceStatusEnum.DRAFT,
    InvoiceStatusEnum.SENT,
    InvoiceStatusEnum.PAID,
    InvoiceStatusEnum.OVERDUE,
    InvoiceStatusEnum.CANCELLED
  ]).optional(),
});

// 一括操作の上限
const BULK_OPERATION_LIMIT = 100; 

// ステータス遷移のルールを定義
const statusTransitions: Record<InvoiceStatusEnum, InvoiceStatusEnum[]> = {
  [InvoiceStatusEnum.DRAFT]: [
    InvoiceStatusEnum.SENT,
    InvoiceStatusEnum.CANCELLED
  ],
  [InvoiceStatusEnum.SENT]: [
    InvoiceStatusEnum.PAID,
    InvoiceStatusEnum.OVERDUE,
    InvoiceStatusEnum.CANCELLED
  ],
  [InvoiceStatusEnum.PAID]: [
    InvoiceStatusEnum.CANCELLED
  ],
  [InvoiceStatusEnum.OVERDUE]: [
    InvoiceStatusEnum.PAID,
    InvoiceStatusEnum.CANCELLED
  ],
  [InvoiceStatusEnum.CANCELLED]: []
};

// ステータス遷移のバリデーション関数
function isValidStatusTransition(
  currentStatus: InvoiceStatusEnum,
  newStatus: InvoiceStatusEnum
): boolean {
  return statusTransitions[currentStatus].includes(newStatus);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. 認証チェック
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ message: msg.auth.required });
  }

  if (req.method === 'POST') {
    try {
      // 2. リクエストのバリデーション
      const validatedData = await bulkActionSchema.parseAsync(req.body);
      
      // 3. 一括操作の上限チェック
      if (validatedData.invoiceIds.length > BULK_OPERATION_LIMIT) {
        return res.status(400).json({ 
          message: `一度に処理できる請求書は${BULK_OPERATION_LIMIT}件までです` 
        });
      }

      // 4. 所有権チェック
      const invoices = await prisma.invoice.findMany({
        where: {
          id: { in: validatedData.invoiceIds },
          createdBy: session.user.id
        }
      });

      if (invoices.length !== validatedData.invoiceIds.length) {
        return res.status(403).json({ 
          message: '操作権限がない請求書が含まれています' 
        });
      }

      // アクション別の処理
      switch (validatedData.action) {
        case 'delete':
          // 削除可能なステータス（DRAFTのみ）をチェック
          const nonDraftInvoices = invoices.filter(inv => inv.status !== InvoiceStatusEnum.DRAFT);
          if (nonDraftInvoices.length > 0) {
            return res.status(400).json({
              message: '下書き以外の請求書は削除できません',
              invoiceIds: nonDraftInvoices.map(inv => inv.id)
            });
          }

          // トランザクションで削除処理
          await prisma.$transaction(async (tx) => {
            // 関連する明細を削除
            await tx.invoiceItem.deleteMany({
              where: { invoiceId: { in: validatedData.invoiceIds } }
            });

            // ステータス履歴を削除
            await tx.invoiceStatus.deleteMany({
              where: { invoiceId: { in: validatedData.invoiceIds } }
            });

            // 請求書を削除
            await tx.invoice.deleteMany({
              where: { id: { in: validatedData.invoiceIds } }
            });
          });

          return res.status(200).json({
            message: '一括削除が完了しました',
            deletedCount: validatedData.invoiceIds.length
          });

        case 'updateStatus':
          if (!validatedData.status) {
            return res.status(400).json({
              message: '更新後のステータスが指定されていません'
            });
          }

          const newStatus = validatedData.status;  // 型推��のため変数に代入

          // トランザクションでステータス更新
          const results = await prisma.$transaction(async (tx) => {
            return Promise.all(
              invoices.map(async (invoice) => {
                try {
                  // ステータス遷移の検
                  if (!isValidStatusTransition(invoice.status, newStatus)) {
                    return {
                      id: invoice.id,
                      success: false,
                      error: `${invoice.status}から${newStatus}への変更はできません`
                    };
                  }

                  // 請求書のステータスを更新
                  await tx.invoice.update({
                    where: { id: invoice.id },
                    data: {
                      status: newStatus,
                      statusHistory: {
                        create: {
                          status: newStatus,
                          comment: `ステータスを${newStatus}に一括更新`,
                          createdBy: session.user.id
                        }
                      }
                    }
                  });

                  return { id: invoice.id, success: true };
                } catch (error) {
                  return {
                    id: invoice.id,
                    success: false,
                    error: '更新処理に失敗しました'
                  };
                }
              })
            );
          });

          return res.status(200).json({
            message: 'ステータス更新が完了しま',
            results
          });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}