import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mail';
import { validationMessages as msg } from '@/lib/validations/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: msg.validation.invalid });
  }

  if (req.method === 'POST') {
    try {
      const { status, comment } = req.body;

      // ステータス履歴を追加
      const updatedOrder = await prisma.purchaseOrder.update({
        where: { id },
        data: {
          statusHistory: {
            create: {
              status,
              comment,
              createdBy: session.user.id,
            },
          },
        },
        include: {
          vendor: true,
          items: true,
          statusHistory: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      // メール送信
      if (updatedOrder.vendor.email) {
        await sendEmail(updatedOrder.vendor.email, 'statusUpdated', {
          orderNumber: updatedOrder.orderNumber,
          vendorName: updatedOrder.vendor.name,
          status: getStatusLabel(status), // ステータスの日本語表示
        });
      }

      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error('Status update error:', error);
      return res.status(500).json({ message: 'ステータスの更新中にエラーが発生しました' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

// ステータスラベルの取得関数
function getStatusLabel(status: string): string {
  const statusMap: { [key: string]: string } = {
    draft: '下書き',
    sent: '送信済み',
    accepted: '承認済み',
    rejected: '却下',
    completed: '完了',
  };
  return statusMap[status] || status;
} 