import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';

// エクスポート可能なフィールドの定義
const EXPORTABLE_FIELDS = {
  name: '会社名',
  email: 'メールアドレス',
  address: '住所',
  phone: '電話番号',
  registrationNumber: '登録番号',
  contactPerson: '担当者',
  status: 'ステータス',
  tags: 'タグ',
  createdAt: '登録日',
  updatedAt: '更新日',
} as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session?.user) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  if (req.method === 'POST') {
    try {
      const { fields, filters } = req.body;

      // フィールドの検証
      if (!Array.isArray(fields) || fields.length === 0) {
        return res.status(400).json({ message: 'エクスポートするフィールドを選択してください' });
      }

      // 不正なフィールドの除外
      const validFields = fields.filter(field => field in EXPORTABLE_FIELDS);

      // 検索条件の構築
      const where: any = {
        createdBy: session.user.id,
      };

      if (filters) {
        if (filters.status) {
          where.status = filters.status;
        }
        if (filters.tags) {
          where.tags = {
            hasEvery: Array.isArray(filters.tags) ? filters.tags : [filters.tags],
          };
        }
        if (filters.search) {
          where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
            { registrationNumber: { contains: filters.search, mode: 'insensitive' } },
            { address: { contains: filters.search, mode: 'insensitive' } },
            { phone: { contains: filters.search, mode: 'insensitive' } },
            { contactPerson: { contains: filters.search, mode: 'insensitive' } },
          ];
        }
      }

      // データの取得
      const vendors = await prisma.vendor.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        select: validFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}),
      });

      // CSVデータの生成
      const header = validFields.map(field => EXPORTABLE_FIELDS[field as keyof typeof EXPORTABLE_FIELDS]);
      const rows = vendors.map(vendor => {
        return validFields.map(field => {
          const value = vendor[field as keyof typeof vendor];
          if (Array.isArray(value)) {
            return value.join(', ');
          }
          if (value instanceof Date) {
            return value.toLocaleString('ja-JP');
          }
          if (field === 'status') {
            return value === 'active' ? '有効' : '無効';
          }
          return value?.toString() || '';
        });
      });

      const csvContent = [
        header.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // CSVファイルとしてレスポンスを返す
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=vendors.csv');
      return res.status(200).send(csvContent);
    } catch (error) {
      console.error('Export error:', error);
      return res.status(500).json({ message: 'エクスポート中にエラーが発生しました' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 