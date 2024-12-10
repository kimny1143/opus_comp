import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { validationMessages as msg } from '@/lib/validations/messages';
import { purchaseOrderSchema } from '@/lib/validations/purchase-order';
import { PurchaseOrderStatusEnum, Prisma } from '@prisma/client';
import { sendEmail } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ message: msg.auth.required });
  }

  if (req.method === 'POST') {
    try {
      const validatedData = await purchaseOrderSchema.parseAsync(req.body);

      // 取引先の存在確認
      const vendor = await prisma.vendor.findUnique({
        where: { id: validatedData.vendorId }
      });

      if (!vendor) {
        return res.status(404).json({ message: msg.vendor.notFound });
      }

      // 金額計算を含むアイテムデータの作成
      const itemsWithAmount = validatedData.items.map(item => ({
        ...item,
        amount: item.quantity * item.unitPrice
      }));

      // 合計金額と消費税の計算
      const totalAmount = itemsWithAmount.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = itemsWithAmount.reduce((sum, item) => 
        sum + Math.floor(item.amount * (item.taxRate / 100)), 0
      );

      // 発注書の作成
      const order = await prisma.purchaseOrder.create({
        data: {
          ...validatedData,
          orderNumber: validatedData.orderNumber || generateOrderNumber(),
          createdBy: session.user.id,
          totalAmount,
          taxAmount,
          statusHistory: {
            create: {
              status: PurchaseOrderStatusEnum.DRAFT,
              comment: '発注書を作成しました',
              createdBy: session.user.id,
            },
          },
          items: {
            create: itemsWithAmount
          }
        },
        include: {
          vendor: true,
          items: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      // 注文番号生成関数
      function generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `PO${year}${month}${day}${random}`;
      }

      // メール送信
      if (vendor.email) {
        await sendEmail(vendor.email, 'orderCreated', {
          orderNumber: order.orderNumber,
          vendorName: vendor.name,
        });
      }

      return res.status(201).json(order);

    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: msg.error.system });
    }
  }

  if (req.method === 'GET') {
    try {
      const {
        search,
        status,
        startDate,
        endDate,
        vendorId,
        page = '1',
        limit = '10'
      } = req.query;

      // 検索条件の構築
      const where: Prisma.PurchaseOrderWhereInput = {
        createdBy: session.user.id,
        // 日付範囲
        ...(startDate && {
          orderDate: {
            gte: new Date(startDate as string)
          }
        }),
        ...(endDate && {
          orderDate: {
            lte: new Date(endDate as string)
          }
        }),
        // ステータス
        ...(status && {
          status: status as PurchaseOrderStatusEnum
        }),
        // 取引先
        ...(vendorId && {
          vendorId: vendorId as string
        }),
        // 検索
        ...(search && {
          OR: [
            { orderNumber: { contains: search as string, mode: 'insensitive' } },
            { vendor: { name: { contains: search as string, mode: 'insensitive' } } }
          ]
        })
      };

      // ページネーション
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const take = parseInt(limit as string);

      // データ取得
      const [orders, total] = await Promise.all([
        prisma.purchaseOrder.findMany({
          where,
          include: {
            vendor: true,
            items: true,
            statusHistory: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        prisma.purchaseOrder.count({ where })
      ]);

      return res.status(200).json({
        orders,
        total,
        page: parseInt(page as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      });

    } catch (error) {
      return res.status(500).json({ message: msg.error.system });
    }
  }

  return res.status(405).json({ message: msg.error.methodNotAllowed });
} 