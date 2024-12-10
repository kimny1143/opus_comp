import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: '無効なIDです' });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            name: true,
            email: true,
          },
        },
        items: true,
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
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

    if (!invoice) {
      return res.status(404).json({ error: '請求書が見つかりません' });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: '請求書の取得に失敗しました' });
  }
} 