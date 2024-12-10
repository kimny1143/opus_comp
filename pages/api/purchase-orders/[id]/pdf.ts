import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import PDFDocument from 'pdfkit';
import { validationMessages as msg } from '@/lib/validations/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: msg.validation.invalid });
  }

  try {
    // 発注書データの取得
    const order = await prisma.purchaseOrder.findFirst({
      where: {
        id: id,
        createdBy: session.user.id,
      },
      include: {
        vendor: true,
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: '発注書が見つかりません' });
    }

    // PDFドキュメントの生成
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    // レスポンスヘッダーの設定
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=purchase-order-${order.orderNumber}.pdf`);

    // PDFをストリーミング
    doc.pipe(res);

    // ヘッダー
    doc.fontSize(24)
      .text('発注書', { align: 'center' })
      .moveDown();

    // 発注番号と日付
    doc.fontSize(12)
      .text(`発注番号: ${order.orderNumber}`, { align: 'right' })
      .text(`発注日: ${new Date(order.orderDate).toLocaleDateString()}`, { align: 'right' })
      .moveDown();

    // 取引先情報
    doc.fontSize(12)
      .text(`${order.vendor.name} 御中`, { align: 'left' })
      .moveDown();

    // 明細テーブルヘッダー
    const tableTop = doc.y + 20;
    doc.fontSize(10)
      .text('品目', 50, tableTop)
      .text('数量', 250, tableTop)
      .text('単価', 300, tableTop)
      .text('税率', 380, tableTop)
      .text('金額', 450, tableTop);

    // 罫線
    doc.moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // 明細行
    let y = tableTop + 30;
    order.items.forEach((item) => {
      doc.fontSize(10)
        .text(item.itemName, 50, y)
        .text(item.quantity.toString(), 250, y)
        .text(`¥${item.unitPrice.toLocaleString()}`, 300, y)
        .text(`${(item.taxRate * 100).toFixed(0)}%`, 380, y)
        .text(`¥${item.amount.toLocaleString()}`, 450, y);
      y += 20;
    });

    // 合計金額
    doc.moveDown(2)
      .fontSize(10)
      .text(`小計: ¥${order.totalAmount.toLocaleString()}`, { align: 'right' })
      .text(`消費税: ¥${order.taxAmount.toLocaleString()}`, { align: 'right' })
      .fontSize(12)
      .text(`合計金額: ¥${(order.totalAmount + order.taxAmount).toLocaleString()}`, { align: 'right' })
      .moveDown();

    // 備考
    if (order.description) {
      doc.moveDown()
        .fontSize(10)
        .text('備考:', { underline: true })
        .text(order.description);
    }

    // 取引条件
    if (order.terms) {
      doc.moveDown()
        .fontSize(10)
        .text('引条件:', { underline: true })
        .text(order.terms);
    }

    // PDFの終了
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'PDFの生成中にエラーが発生しました' });
  }
} 