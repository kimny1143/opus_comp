import { PurchaseOrder, Vendor, PurchaseOrderItem } from '@prisma/client';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { createFont } from '@/lib/pdf/fonts';
import { Decimal } from '@prisma/client/runtime/library';

type ExtendedPurchaseOrder = PurchaseOrder & {
  vendor: Vendor;
  items: PurchaseOrderItem[];
};

// Decimalを数値に変換するヘルパー関数
function toNumber(decimal: Decimal): number {
  return decimal.toNumber();
}

export async function generatePurchaseOrderPDF(order: ExtendedPurchaseOrder) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4サイズ
  const { height } = page.getSize();

  // フォントの設定
  const font = await createFont(pdfDoc);
  const fontSize = 10;
  let currentY = height - 50;

  // ヘッダー
  page.drawText('発注書', {
    x: 250,
    y: currentY,
    size: 24,
    font,
  });

  currentY -= 50;

  // 発注情報
  page.drawText(`発注番号: ${order.orderNumber}`, {
    x: 50,
    y: currentY,
    size: fontSize,
    font,
  });

  page.drawText(`発注日: ${new Date(order.orderDate).toLocaleDateString()}`, {
    x: 350,
    y: currentY,
    size: fontSize,
    font,
  });

  currentY -= 30;

  // 取引先情報
  page.drawText('取引先:', {
    x: 50,
    y: currentY,
    size: fontSize,
    font,
  });

  currentY -= 20;

  page.drawText(order.vendor.name, {
    x: 70,
    y: currentY,
    size: fontSize,
    font,
  });

  if (order.vendor.address) {
    currentY -= 15;
    page.drawText(order.vendor.address, {
      x: 70,
      y: currentY,
      size: fontSize,
      font,
    });
  }

  currentY -= 40;

  // 明細テーブル
  const tableHeaders = ['品目', '数量', '単価', '税率', '金額'];
  const columnWidths = [250, 60, 80, 60, 80];
  let currentX = 50;

  // ヘッダー行
  tableHeaders.forEach((header, index) => {
    page.drawText(header, {
      x: currentX,
      y: currentY,
      size: fontSize,
      font,
    });
    currentX += columnWidths[index];
  });

  currentY -= 20;

  // 明細行
  order.items.forEach((item) => {
    currentX = 50;

    // 品目
    page.drawText(item.itemName, {
      x: currentX,
      y: currentY,
      size: fontSize,
      font,
    });
    currentX += columnWidths[0];

    // 数量
    page.drawText(item.quantity.toString(), {
      x: currentX,
      y: currentY,
      size: fontSize,
      font,
    });
    currentX += columnWidths[1];

    // 単価
    page.drawText(`¥${item.unitPrice.toLocaleString()}`, {
      x: currentX,
      y: currentY,
      size: fontSize,
      font,
    });
    currentX += columnWidths[2];

    // 税率
    page.drawText(`${(toNumber(item.taxRate) * 100).toFixed(0)}%`, {
      x: currentX,
      y: currentY,
      size: fontSize,
      font,
    });
    currentX += columnWidths[3];

    // 金額
    page.drawText(`¥${item.amount.toLocaleString()}`, {
      x: currentX,
      y: currentY,
      size: fontSize,
      font,
    });

    currentY -= 20;
  });

  currentY -= 20;

  // 合計金額
  const totalAmount = toNumber(order.totalAmount);
  const taxAmount = toNumber(order.taxAmount);
  
  page.drawText(`小計: ¥${totalAmount.toLocaleString()}`, {
    x: 400,
    y: currentY,
    size: fontSize,
    font,
  });

  currentY -= 20;

  page.drawText(`消費税: ¥${taxAmount.toLocaleString()}`, {
    x: 400,
    y: currentY,
    size: fontSize,
    font,
  });

  currentY -= 20;

  page.drawText(`合計: ¥${(totalAmount + taxAmount).toLocaleString()}`, {
    x: 400,
    y: currentY,
    size: fontSize,
    font,
  });

  return pdfDoc;
} 