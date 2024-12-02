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

  if (req.method === 'POST') {
    try {
      const { action, vendorIds } = req.body;

      if (!Array.isArray(vendorIds) || vendorIds.length === 0) {
        return res.status(400).json({ message: '取引先が選択されていません' });
      }

      // 権限チェック
      const vendors = await prisma.vendor.findMany({
        where: {
          id: { in: vendorIds },
          createdBy: session.user.id,
        },
      });

      if (vendors.length !== vendorIds.length) {
        return res.status(403).json({ message: '操作権限がない取引先が含まれています' });
      }

      let result;
      switch (action) {
        case 'activate':
          result = await prisma.vendor.updateMany({
            where: { id: { in: vendorIds } },
            data: { status: 'active' },
          });
          break;

        case 'deactivate':
          result = await prisma.vendor.updateMany({
            where: { id: { in: vendorIds } },
            data: { status: 'inactive' },
          });
          break;

        case 'addTag':
          const { tag } = req.body;
          if (!tag) {
            return res.status(400).json({ message: 'タグが指定されていません' });
          }

          // 各取引先のタグを更新
          await Promise.all(
            vendors.map(async (vendor) => {
              const currentTags = vendor.tags || [];
              if (!currentTags.includes(tag)) {
                await prisma.vendor.update({
                  where: { id: vendor.id },
                  data: { tags: [...currentTags, tag] },
                });
              }
            })
          );
          result = { count: vendors.length };
          break;

        case 'removeTag':
          const { tag: tagToRemove } = req.body;
          if (!tagToRemove) {
            return res.status(400).json({ message: 'タグが指定されていません' });
          }

          // 各取引先のタグを更新
          await Promise.all(
            vendors.map(async (vendor) => {
              const currentTags = vendor.tags || [];
              await prisma.vendor.update({
                where: { id: vendor.id },
                data: { tags: currentTags.filter(t => t !== tagToRemove) },
              });
            })
          );
          result = { count: vendors.length };
          break;

        default:
          return res.status(400).json({ message: '不正な操作です' });
      }

      return res.status(200).json({
        message: '一括操作が完了しました',
        affected: result.count,
      });
    } catch (error) {
      console.error('Bulk operation error:', error);
      return res.status(500).json({ message: '一括操作中にエラーが発生しました' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 