import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  // GET: テンプレート一覧の取得
  if (req.method === 'GET') {
    try {
      const templates = await prisma.invoiceTemplate.findMany({
        where: {
          createdBy: session.user.id,
        },
        include: {
          vendor: true,
          items: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      return res.status(200).json(templates);
    } catch (error) {
      console.error('Template fetch error:', error);
      return res.status(500).json({ message: 'テンプレートの取得に失敗しました' });
    }
  }

  // POST: テンプレートの新規作成
  if (req.method === 'POST') {
    try {
      const {
        name,
        description,
        vendorId,
        dueDate,
        paymentMethod,
        bankAccount,
        notes,
        items,
      } = req.body;

      const template = await prisma.invoiceTemplate.create({
        data: {
          name,
          description,
          vendorId,
          dueDate: parseInt(dueDate),
          paymentMethod,
          bankAccount,
          notes,
          createdBy: session.user.id,
          items: {
            create: items.map((item: any) => ({
              itemName: item.itemName,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
            })),
          },
        },
        include: {
          vendor: true,
          items: true,
        },
      });

      return res.status(201).json(template);
    } catch (error) {
      console.error('Template creation error:', error);
      return res.status(500).json({ message: 'テンプレートの作成に失敗しました' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 