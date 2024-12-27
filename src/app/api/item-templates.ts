import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { PurchaseOrderItem } from '@/types/purchaseOrder';
import { InvoiceTemplateItem, Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';

interface CreateTemplateBody {
  name: string;
  description?: string;
  contractorName: string;
  contractorAddress: string;
  registrationNumber: string;
  bankInfo: {
    bankName: string;
    branchName: string;
    accountType: 'ordinary' | 'current';
    accountNumber: string;
    accountHolder: string;
  };
  paymentTerms: string;
  notes: string;
  items: PurchaseOrderItem[];
}

interface TemplateResponse {
  id: string;
  name: string;
  description?: string;
  contractorName: string;
  contractorAddress: string;
  registrationNumber: string;
  bankInfo: {
    bankName: string;
    branchName: string;
    accountType: 'ordinary' | 'current';
    accountNumber: string;
    accountHolder: string;
  };
  paymentTerms: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  items: InvoiceTemplateItem[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  if (req.method === 'GET') {
    try {
      const templates = await prisma.invoiceTemplate.findMany({
        include: {
          templateItems: true
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
      const {
        name,
        description,
        contractorName,
        contractorAddress,
        registrationNumber,
        bankInfo,
        paymentTerms,
        notes,
        items
      } = req.body as CreateTemplateBody;

      const template = await prisma.invoiceTemplate.create({
        data: {
          name,
          description,
          contractorName,
          contractorAddress,
          registrationNumber,
          bankInfo,
          paymentTerms,
          notes,
          userId: session.user.id,
          templateItems: {
            create: items.map(item => ({
              itemName: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: new Prisma.Decimal(0.1),
              description: item.description || null
            }))
          }
        },
        include: {
          templateItems: true
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
      const {
        id,
        name,
        description,
        contractorName,
        contractorAddress,
        registrationNumber,
        bankInfo,
        paymentTerms,
        notes,
        items
      } = req.body as CreateTemplateBody & { id: string };

      // 既存のテンプレートアイテムを削除
      await prisma.invoiceTemplateItem.deleteMany({
        where: { templateId: id }
      });

      // テンプレートを更新
      const template = await prisma.invoiceTemplate.update({
        where: { id },
        data: {
          name,
          description,
          contractorName,
          contractorAddress,
          registrationNumber,
          bankInfo,
          paymentTerms,
          notes,
          templateItems: {
            create: items.map(item => ({
              itemName: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: new Prisma.Decimal(0.1),
              description: item.description || null
            }))
          }
        },
        include: {
          templateItems: true
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