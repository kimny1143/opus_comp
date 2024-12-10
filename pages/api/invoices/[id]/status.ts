import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { validationMessages as msg } from '@/lib/validations/messages';
import { InvoiceStatusEnum } from '@prisma/client';
import { z } from 'zod';

// バリデーションスキーマ
const statusUpdateSchema = z.object({
  status: z.enum([
    InvoiceStatusEnum.DRAFT,
    InvoiceStatusEnum.SENT,
    InvoiceStatusEnum.PAID,
    InvoiceStatusEnum.OVERDUE,
    InvoiceStatusEnum.CANCELLED
  ]),
  comment: z.string().optional()
});

// ステータス遷移のルールは bulk.ts と共有
const statusTransitions: Record<InvoiceStatusEnum, InvoiceStatusEnum[]> = {
  [InvoiceStatusEnum.DRAFT]: [InvoiceStatusEnum.SENT, InvoiceStatusEnum.CANCELLED],
  [InvoiceStatusEnum.SENT]: [InvoiceStatusEnum.PAID, InvoiceStatusEnum.OVERDUE, InvoiceStatusEnum.CANCELLED],
  [InvoiceStatusEnum.PAID]: [InvoiceStatusEnum.CANCELLED],
  [InvoiceStatusEnum.OVERDUE]: [InvoiceStatusEnum.PAID, InvoiceStatusEnum.CANCELLED],
  [InvoiceStatusEnum.CANCELLED]: []
}; 

// ステータス遷移のリデーション関数
function isValidStatusTransition(
  currentStatus: InvoiceStatusEnum,
  newStatus: InvoiceStatusEnum
): boolean {
  return statusTransitions[currentStatus].includes(newStatus);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ message: msg.auth.required });
  }

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      // 請求書の存在と権限チェック
      const invoice = await prisma.invoice.findFirst({
        where: { 
          id: id as string,
          createdBy: session.user.id 
        }
      });

      if (!invoice) {
        return res.status(404).json({ message: msg.invoice.notFound });
      }

      // リクエストのバリデーション
      const validatedData = await statusUpdateSchema.parseAsync(req.body);

      // ステータス遷移の検証
      if (!isValidStatusTransition(invoice.status, validatedData.status)) {
        return res.status(400).json({ 
          message: `${invoice.status}から${validatedData.status}への変更はできません` 
        });
      }

      // トランザクションでステータス更新
      const updated = await prisma.$transaction(async (tx) => {
        // 請求書のステータスを更新
        const updatedInvoice = await tx.invoice.update({
          where: { id: id as string },
          data: {
            status: validatedData.status,
            statusHistory: {
              create: {
                status: validatedData.status,
                comment: validatedData.comment || `ステータスを${validatedData.status}に更新`,
                user: {
                  connect: {
                    id: session.user.id
                  }
                }
              }
            }
          },
          include: {
            statusHistory: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        });

        return updatedInvoice;
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error('Status update error:', error);
      return res.status(500).json({ message: msg.error.update });
    }
  }

  return res.status(405).json({ message: msg.error.methodNotAllowed });
}