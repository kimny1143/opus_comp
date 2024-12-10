import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { PurchaseOrderItem } from '@/types/purchaseOrder';
import { itemTemplate, templateItem } from '@prisma/client';

interface CreateTemplateBody {
  name: string;
  items: PurchaseOrderItem[];
}

interface TemplateResponse extends itemTemplate {
  items: templateItem[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const templates = await prisma.itemTemplate.findMany({
        include: {
          items: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.status(200).json(templates);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'テンプレートの取得に失敗しました' });
    }
  }
  else if (req.method === 'POST') {
    try {
      const { name, items } = req.body as CreateTemplateBody;

      const template = await prisma.itemTemplate.create({
        data: {
          name,
          items: {
            create: items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              description: item.description || null
            }))
          }
        },
        include: {
          items: true
        }
      });

      res.status(200).json(template);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'テンプレートの保存に失敗しました' });
    }
  }
  else if (req.method === 'PUT') {
    try {
      const { id, name, items } = req.body as CreateTemplateBody & { id: string };

      // 既存のテンプレートアイテムを削除
      await prisma.templateItem.deleteMany({
        where: { templateId: id }
      });

      // テンプレートを更新
      const template = await prisma.itemTemplate.update({
        where: { id },
        data: {
          name,
          items: {
            create: items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              description: item.description || null
            }))
          }
        },
        include: {
          items: true
        }
      });

      res.status(200).json(template);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'テンプレートの更新に失敗しました' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 