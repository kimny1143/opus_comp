import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mail';
import { Prisma } from '@prisma/client';

type InvoiceTemplateItem = {
  itemName: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const id = req.query.id as string;

  try {
    // テンプレートの取得
    const template = await prisma.invoiceTemplate.findFirst({
      where: {
        id: id,
        createdBy: session.user.id,
      },
      include: {
        items: true,
      },
    });

    if (!template) {
      return res.status(404).json({ message: 'テンプレートが見つかりません' });
    }

    // 以降のコードは変更なし
    // ...

  } catch (error) {
    console.error('Invoice creation error:', error);
    return res.status(500).json({ message: '請求書の作成に失敗しました' });
  }
} 