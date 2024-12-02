import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session?.user) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  if (req.method === 'GET') {
    try {
      const {
        search,
        status,
        tags,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        page = '1',
        limit = '10'
      } = req.query;

      // 検索条件の構築
      const where: any = {
        createdBy: session.user.id,
      };

      // ステータスフィルター
      if (status) {
        where.status = status;
      }

      // タグフィルター
      if (tags) {
        const tagList = Array.isArray(tags) ? tags : [tags];
        where.tags = {
          hasEvery: tagList,
        };
      }

      // キーワード検索
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { registrationNumber: { contains: search as string, mode: 'insensitive' } },
          { address: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string, mode: 'insensitive' } },
          { contactPerson: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      // ページネーション
      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const skip = (pageNumber - 1) * limitNumber;

      // 並び替え
      const orderBy: any = {};
      orderBy[sortBy as string] = sortOrder;

      // 総件数の取得
      const total = await prisma.vendor.count({ where });

      // データの取得
      const vendors = await prisma.vendor.findMany({
        where,
        orderBy,
        skip,
        take: limitNumber,
      });

      // 利用可能なタグの取得
      const allVendors = await prisma.vendor.findMany({
        where: { createdBy: session.user.id },
        select: { tags: true },
      });
      const availableTags = Array.from(
        new Set(allVendors.flatMap(v => v.tags))
      ).sort();

      return res.status(200).json({
        vendors,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
        availableTags,
      });
    } catch (error) {
      console.error('Vendors fetch error:', error);
      return res.status(500).json({ message: '取引先の取得中にエラーが発生しました' });
    }
  }

  if (req.method === 'POST') {
    try {
      const data = {
        ...req.body,
        createdBy: session.user.id,
      };

      const vendor = await prisma.vendor.create({ data });
      return res.status(201).json(vendor);
    } catch (error) {
      console.error('Vendor creation error:', error);
      return res.status(500).json({ message: '取引先の作成中にエラーが発生しました' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}