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

type ExportableField = keyof typeof EXPORTABLE_FIELDS;

type ExportVendor = {
  [key in ExportableField]?: any;
};

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
      const validFields = fields.filter((field: string) => field in EXPORTABLE_FIELDS);

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
      const vendors: ExportVendor[] = await prisma.vendor.findMany({
        where,
        orderBy: {
          updatedAt: 'desc'
        },
        select: validFields.reduce((acc: any, field: string) => ({
          ...acc,
          [field]: true,
          ...(field === 'tags' ? { tags: { select: { name: true } } } : {}),
        }), {}),
      });

      // CSVフィールドをエスケープする関数
      const escapeCsvField = (field: any): string => {
        if (field === null || field === undefined) {
          return '';
        }
        const stringValue = String(field);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      // CSVデータの生成
      const header = validFields.map((field: string) => EXPORTABLE_FIELDS[field as ExportableField]);
      const rows = vendors.map((vendor: ExportVendor) => {
        return validFields.map((field: string) => {
          const value = vendor[field as ExportableField];
          if (field === 'tags' && Array.isArray(value)) {
            // タグオブジェクトの配列から名前を抽出
            const tagNames = value.map((tag: any) => tag.name);
            return escapeCsvField(tagNames.join(', '));
          }
          if (Array.isArray(value)) {
            return escapeCsvField(value.join(', '));
          }
          if (value instanceof Date) {
            return escapeCsvField(value.toLocaleString('ja-JP'));
          }
          if (field === 'status' && typeof value === 'string') {
            return escapeCsvField(value === 'active' ? '有効' : '無効');
          }
          return escapeCsvField(value);
        });
      });

      const csvContent = [
        header.map(escapeCsvField).join(','),
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