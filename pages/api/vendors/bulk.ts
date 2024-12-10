import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { validationMessages as msg } from '@/lib/validations/messages';
import { z } from 'zod';
import type { Prisma, Tag } from '@prisma/client';

// バリデーションスキーマ
const bulkActionSchema = z.object({
  action: z.enum(['delete', 'updateStatus', 'addTags', 'removeTags']),
  vendorIds: z.array(z.string()).min(1, '取引先を選択してください'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']).optional(),
  tags: z.array(z.string()).optional(),
});

// 一括操作の上限
const BULK_OPERATION_LIMIT = 100;

// 追加: タグ操作の型定義を修正
type TagOperation = {
  action: 'addTags' | 'removeTags';
  vendorIds: string[];
  tags: string[];
};

// 追加: タグ処理関数の型を修正
async function handleTagOperation(
  tx: Prisma.TransactionClient,
  vendors: { id: string }[],
  operation: Pick<TagOperation, 'tags'> & { action: 'addTags' | 'removeTags' }
) {
  const existingTags = await tx.tag.findMany({
    where: { name: { in: operation.tags } }
  });

  const newTagNames = operation.tags.filter(
    tag => !existingTags.some((et: Tag) => et.name === tag)
  );

  const newTags = await Promise.all(
    newTagNames.map(name =>
      tx.tag.create({ data: { name } })
    )
  );

  const allTags = [...existingTags, ...newTags];

  if (operation.action === 'addTags') {
    // タグの追加
    await Promise.all(
      vendors.map(vendor =>
        tx.vendorTag.createMany({
          data: allTags.map(tag => ({
            vendorId: vendor.id,
            tagId: tag.id
          })),
          skipDuplicates: true
        })
      )
    );
  } else {
    // タグの削除
    await tx.vendorTag.deleteMany({
      where: {
        vendorId: { in: vendors.map(v => v.id) },
        tagId: { in: allTags.map(t => t.id) }
      }
    });
  }

  return { count: vendors.length };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ message: msg.auth.required });
  }

  if (req.method === 'POST') {
    try {
      const validatedData = await bulkActionSchema.parseAsync(req.body);
      
      // 上限チェック
      if (validatedData.vendorIds.length > BULK_OPERATION_LIMIT) {
        return res.status(400).json({ 
          message: `一度に処理できる取引先は${BULK_OPERATION_LIMIT}件までです` 
        });
      }

      // トランザクションで一括処理
      const result = await prisma.$transaction(async (tx) => {
        // 所有権チェック
        const vendors = await tx.vendor.findMany({
          where: {
            id: { in: validatedData.vendorIds },
            createdById: session.user.id
          },
          include: {
            purchaseOrders: { select: { id: true } },
            invoices: { select: { id: true } }
          }
        });

        // アクション別の処理
        switch (validatedData.action) {
          case 'delete':
            // 関連データチェック
            const hasRelatedData = vendors.some(v => 
              v.purchaseOrders.length > 0 || v.invoices.length > 0
            );
            if (hasRelatedData) {
              throw new Error(msg.vendor.hasRelatedData);
            }
            // 削除処理
            await tx.vendorTag.deleteMany({
              where: { vendorId: { in: validatedData.vendorIds } }
            });
            return await tx.vendor.deleteMany({
              where: { id: { in: validatedData.vendorIds } }
            });

          case 'updateStatus':
            if (!validatedData.status) {
              throw new Error('ステータスが指定されていません');
            }
            return await tx.vendor.updateMany({
              where: { id: { in: validatedData.vendorIds } },
              data: { status: validatedData.status }
            });

          case 'addTags':
          case 'removeTags':
            if (!validatedData.tags?.length) {
              throw new Error('タグが指定されていません');
            }
            return await handleTagOperation(tx, vendors, {
              action: validatedData.action,
              tags: validatedData.tags
            });
        }
      });

      return res.status(200).json({
        message: '一括操作が完了しました',
        affected: result.count
      });
    } catch (error) {
      console.error('Bulk operation error:', error);
      return res.status(500).json({ message: '一括操作中にエラーが発生しました' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 