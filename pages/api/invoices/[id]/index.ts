import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  const id = req.query.id as string;

  if (req.method === 'GET') {
    try {
      const invoice = await prisma.invoice.findFirst({
        where: {
          id: id,
          createdBy: session.user.id,
        },
        include: {
          vendor: true,
          items: true,
          purchaseOrder: true,
          statusHistory: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
      });

      if (!invoice) {
        return res.status(404).json({ message: '請求書が見つかりません' });
      }

      return res.status(200).json(invoice);
    } catch (error) {
      console.error('Invoice fetch error:', error);
      return res.status(500).json({ message: '請求書の取得中にエラーが発生しました' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 