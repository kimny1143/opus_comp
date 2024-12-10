import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: '認証が必要です' });
    }

    const { id } = req.query;
    const { paymentDate, paymentMethod, amount, notes } = req.body;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: '無効なIDです' });
    }

    // トランザクションで支払記録を登録
    const result = await prisma.$transaction(async (tx) => {
      // 請求書の更新
      const updatedInvoice = await tx.invoice.update({
        where: { id },
        data: {
          status: 'PAID',
          paymentDate: new Date(paymentDate),
          paymentMethod,
          statusHistory: {
            create: {
              status: 'PAID',
              comment: notes,
              user: {
                connect: {
                  id: session.user.id
                }
              }
            },
          },
        },
        include: {
          statusHistory: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return updatedInvoice;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: '支払記録の登録に失敗しました' });
  }
} 