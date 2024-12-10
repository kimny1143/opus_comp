import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, startOfYear } from 'date-fns';
import { InvoiceStatusEnum } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { status, dateRange, vendorId, search } = req.query;
    const now = new Date();

    // フィルター条件の構築
    const whereClause: any = {};

    // ステータスフィルター
    if (status && status !== 'ALL') {
      whereClause.status = status as InvoiceStatusEnum;
    }

    // 取引先フィルター
    if (vendorId && vendorId !== 'ALL') {
      whereClause.vendorId = vendorId;
    }

    // 日付範囲フィルター
    if (dateRange) {
      switch (dateRange) {
        case 'THIS_MONTH':
          whereClause.issueDate = {
            gte: startOfMonth(now),
            lte: endOfMonth(now),
          };
          break;
        case 'LAST_MONTH':
          const lastMonth = subMonths(now, 1);
          whereClause.issueDate = {
            gte: startOfMonth(lastMonth),
            lte: endOfMonth(lastMonth),
          };
          break;
        case 'THIS_YEAR':
          whereClause.issueDate = {
            gte: startOfYear(now),
            lte: now,
          };
          break;
      }
    }

    // 検索フィルター
    if (search) {
      whereClause.OR = [
        { invoiceNumber: { contains: search as string, mode: 'insensitive' } },
        { vendor: { name: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    // 未払いの合計
    const unpaidTotal = await prisma.invoice.aggregate({
      where: {
        ...whereClause,
        status: 'SENT',
      },
      _sum: {
        totalAmount: true,
      },
    });

    // 期限超過の合計
    const overdueTotal = await prisma.invoice.aggregate({
      where: {
        ...whereClause,
        status: 'OVERDUE',
      },
      _sum: {
        totalAmount: true,
      },
    });

    // 支払済みの合計
    const paidTotal = await prisma.invoice.aggregate({
      where: {
        ...whereClause,
        status: 'PAID',
        paymentDate: {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // 今週の支払予定
    const upcomingTotal = await prisma.invoice.aggregate({
      where: {
        ...whereClause,
        status: 'SENT',
        dueDate: {
          gte: startOfWeek(now, { weekStartsOn: 1 }),
          lte: endOfWeek(now, { weekStartsOn: 1 }),
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // 請求書一覧
    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        vendor: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      ...(req.query.export !== 'true' && { take: 50 }),
    });

    // 合計件数の取得（ページネーション用）
    const totalCount = await prisma.invoice.count({
      where: whereClause,
    });

    res.status(200).json({
      stats: {
        totalUnpaid: unpaidTotal._sum.totalAmount?.toNumber() || 0,
        totalOverdue: overdueTotal._sum.totalAmount?.toNumber() || 0,
        totalPaid: paidTotal._sum.totalAmount?.toNumber() || 0,
        upcomingPayments: upcomingTotal._sum.totalAmount?.toNumber() || 0,
      },
      invoices,
      totalCount,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'データの取得に失敗しました' });
  }
} 