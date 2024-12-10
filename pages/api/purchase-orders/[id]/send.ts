import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { generatePurchaseOrderPDF } from '@/lib/pdf/templates/purchase-order';
import { sendPurchaseOrderMail } from '@/lib/mail/sendMail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: '無効なIDです' });
    }

    // 発注書データの取得
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        vendor: true,
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: '発注書が見つかりません' });
    }

    if (!order.vendor.email) {
      return res.status(400).json({ error: '取引先のメールアドレスが設定されていません' });
    }

    // PDFの生成
    const pdfDoc = await generatePurchaseOrderPDF(order);

    // メール送信
    await sendPurchaseOrderMail(
      order.vendor.email,
      order.orderNumber,
      pdfDoc,
      {
        text: req.body.message, // オプションのカスタムメッセージ
      }
    );

    // ステータスを更新
    await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: 'SENT',
        statusHistory: {
          create: {
            status: 'SENT',
            comment: 'メールで送信されました',
            createdBy: req.body.userId, // 要認証
          },
        },
      },
    });

    res.status(200).json({ message: '発注書を送信しました' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: '発注書の送信に失敗しました' });
  }
} 