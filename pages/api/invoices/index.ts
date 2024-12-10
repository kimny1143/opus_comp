import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { invoiceSchema } from '@/lib/validations/invoice';
import { validationMessages as msg } from '@/lib/validations/messages';
import { Prisma } from '@prisma/client';
import type { InvoiceStatus as PrismaInvoiceStatus } from '@prisma/client';
import { InvoiceStatusEnum } from '@prisma/client';

// クエリパラメータの型定義
type QueryParams = {
  page: number;
  limit: number;
  status?: InvoiceStatusEnum;
  vendorId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
};

// クエリパラメータのパース
function parseQueryParams(query: NextApiRequest['query']): QueryParams {
  const status = query.status as string;
  const validStatus = Object.values(InvoiceStatusEnum).includes(status as InvoiceStatusEnum)
    ? (status as InvoiceStatusEnum)
    : undefined;

  return {
    page: Number(query.page) || 1,
    limit: Number(query.limit) || 10,
    status: validStatus,
    vendorId: query.vendorId as string,
    startDate: query.startDate ? new Date(query.startDate as string) : undefined,
    endDate: query.endDate ? new Date(query.endDate as string) : undefined,
    search: query.search as string,
  };
}

// 検索条件の構築
function buildWhereClause({
  userId,
  status,
  vendorId,
  startDate,
  endDate,
  search,
}: {
  userId: string;
  status?: InvoiceStatusEnum;
  vendorId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}): Prisma.InvoiceWhereInput {
  return {
    createdBy: userId,
    ...(status && { status }),
    ...(vendorId && { vendorId }),
    ...(startDate && { issueDate: { gte: startDate } }),
    ...(endDate && { issueDate: { lte: endDate } }),
    ...(search && {
      OR: [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { vendor: { name: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ message: msg.auth.required });
  }

  if (req.method === 'GET') {
    try {
      const {
        page,
        limit,
        status,
        vendorId,
        startDate,
        endDate,
        search,
      } = parseQueryParams(req.query);

      // ページネーション変数の計算
      const itemsPerPage = limit;
      const currentPage = page;
      const skip = (currentPage - 1) * itemsPerPage;

      // 検索条件の構築
      const where = buildWhereClause({
        userId: session.user.id,
        status,
        vendorId,
        startDate,
        endDate,
        search,
      });

      // 件数の取得
      const total = await prisma.invoice.count({ where });

      // ページネーション付きで請求書を取得
      const invoices = await prisma.invoice.findMany({
        where,
        include: {
          vendor: true,
          items: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: itemsPerPage,
      });

      return res.status(200).json({
        invoices,
        pagination: {
          total,
          pages: Math.ceil(total / itemsPerPage),
          currentPage,
          itemsPerPage,
        },
      });
    } catch (error) {
      console.error('Invoices fetch error:', error);
      return res.status(500).json({ message: '請求書の取得中にエラーが発生しました' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 