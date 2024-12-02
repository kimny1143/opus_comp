import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  const vendorId = req.query.id as string;

  if (!session?.user) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  // GET: 取引先詳細の取得
  if (req.method === 'GET') {
    try {
      const vendor = await prisma.vendor.findFirst({
        where: {
          id: vendorId,
          createdBy: session.user.id,
        },
      });

      if (!vendor) {
        return res.status(404).json({ message: '取引先が見つかりません' });
      }

      return res.status(200).json(vendor);
    } catch (error) {
      console.error('Vendor fetch error:', error);
      return res.status(500).json({ message: '取引先の取得中にエラーが発生しました' });
    }
  }

  // PUT: 取引先情報の更新
  if (req.method === 'PUT') {
    try {
      const vendor = await prisma.vendor.findFirst({
        where: {
          id: vendorId,
          createdBy: session.user.id,
        },
      });

      if (!vendor) {
        return res.status(404).json({ message: '取引先が見つかりません' });
      }

      const updatedVendor = await prisma.vendor.update({
        where: { id: vendorId },
        data: req.body,
      });

      return res.status(200).json(updatedVendor);
    } catch (error) {
      console.error('Vendor update error:', error);
      return res.status(500).json({ message: '取引先の更新中にエラーが発生しました' });
    }
  }

  // DELETE: 取引先の削除（または無効化）
  if (req.method === 'DELETE') {
    try {
      const vendor = await prisma.vendor.findFirst({
        where: {
          id: vendorId,
          createdBy: session.user.id,
        },
      });

      if (!vendor) {
        return res.status(404).json({ message: '取引先が見つかりません' });
      }

      // ソフトデリート（ステータスを無効に変更）
      const updatedVendor = await prisma.vendor.update({
        where: { id: vendorId },
        data: { status: 'inactive' },
      });

      return res.status(200).json(updatedVendor);
    } catch (error) {
      console.error('Vendor deletion error:', error);
      return res.status(500).json({ message: '取引先の削除中にエラーが発生しました' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 