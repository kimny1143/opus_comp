import PDFDocument from 'pdfkit';
import { Invoice, InvoiceItem, Vendor } from '@prisma/client';
import path from 'path';
import { promises as fs } from 'fs';

interface InvoiceWithRelations extends Invoice {
  vendor: Vendor;
  items: InvoiceItem[];
}

interface CompanyInfo {
  name: string;
  postalCode: string;
  address: string;
  tel: string;
  email: string;
  logoPath?: string;
}

// カスタムエラー定�
export class PDFGenerationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'PDFGenerationError';
  }
}

// エラーメッセージ
const errorMessages = {
  fontNotFound: 'フォントファイルが見つかりません',
  logoNotFound: 'ロゴファイルが見つかりません',
  invalidData: 'PDFの生成に必要なデータが不正です',
  pdfGeneration: 'PDFの生成中にエラーが発生しました'
} as const;

// フォント設定
async function setupFont(doc: PDFKit.PDFDocument) {
  const FONT_PATH = path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-Regular.otf');
  
  try {
    await fs.access(FONT_PATH);
    doc.registerFont('NotoSans', FONT_PATH);
    doc.font('NotoSans');
  } catch (error) {
    console.warn('Japanese font not found, falling back to default font');
    // デフォルトフォントを使用
  }
}

export async function generateInvoicePDF(
  doc: PDFKit.PDFDocument,
  invoice: InvoiceWithRelations,
  companyInfo: CompanyInfo
) {
  try {
    // データの検証
    if (!invoice.items?.length) {
      throw new PDFGenerationError(errorMessages.invalidData);
    }

    // フォント設定
    await setupFont(doc);
    
    // 各セクションの描画
    await drawHeader(doc, companyInfo);
    drawInvoiceInfo(doc, invoice);
    drawItemsTable(doc, invoice.items);
    drawSummary(doc, invoice.items);
    drawNotes(doc, invoice.notes);
    drawPaymentTerms(doc, invoice);

  } catch (error) {
    if (error instanceof PDFGenerationError) {
      throw error;
    }
    throw new PDFGenerationError(errorMessages.pdfGeneration, error);
  }
}

// ヘッダー部分の描画
async function drawHeader(
  doc: PDFKit.PDFDocument,
  companyInfo: CompanyInfo
) {
  if (companyInfo.logoPath) {
    try {
      await fs.access(companyInfo.logoPath);
      doc.image(companyInfo.logoPath, 50, 50, { fit: [100, 100] });
    } catch (error) {
      console.warn('Logo file not found:', error);
    }
  }

  doc.fontSize(10)
     .text(companyInfo.name, 350, 50, { align: 'right' })
     .text(companyInfo.postalCode, 350, undefined, { align: 'right' })
     .text(companyInfo.address, 350, undefined, { align: 'right' })
     .text(`TEL: ${companyInfo.tel}`, 350, undefined, { align: 'right' })
     .text(`Email: ${companyInfo.email}`, 350, undefined, { align: 'right' });
}

// 請求書基本情報の描画
function drawInvoiceInfo(
  doc: PDFKit.PDFDocument,
  invoice: InvoiceWithRelations
) {
  doc.fontSize(24).text('請求書', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12)
     .text(`請求書番号: ${invoice.invoiceNumber}`, { align: 'right' })
     .text(`発行日: ${invoice.issueDate.toLocaleDateString('ja-JP')}`, { align: 'right' });

  doc.moveDown();
  doc.fontSize(14).text('請求先:', { continued: true });
  doc.fontSize(12).text(invoice.vendor.name);
  if (invoice.vendor.address) {
    doc.text(invoice.vendor.address);
  }
} 

// 明細テーブルの描画
function drawItemsTable(
  doc: PDFKit.PDFDocument,
  items: InvoiceItem[]
) {
  const columns = {
    item: { x: 50, w: 250 },
    quantity: { x: 300, w: 70 },
    price: { x: 370, w: 80 },
    amount: { x: 450, w: 90 }
  };

  // ヘッダー行
  doc.fontSize(12);
  const tableTop = doc.y;
  doc
    .text('品目', columns.item.x, tableTop)
    .text('数量', columns.quantity.x, tableTop)
    .text('単価', columns.price.x, tableTop)
    .text('金額', columns.amount.x, tableTop);

  // 区切り線
  doc.moveTo(50, doc.y + 5)
     .lineTo(540, doc.y + 5)
     .stroke();

  // 明細行
  const lineHeight = 20;
  items.forEach((item, i) => {
    const y = doc.y + lineHeight;
    const amount = item.quantity * item.unitPrice;

    doc
      .text(item.itemName, columns.item.x, y)
      .text(item.quantity.toString(), columns.quantity.x, y)
      .text(item.unitPrice.toLocaleString(), columns.price.x, y)
      .text(amount.toLocaleString(), columns.amount.x, y);

    doc.y = y;
  });
} 

// 金額サマリーの描画
function drawSummary(
  doc: PDFKit.PDFDocument,
  items: InvoiceItem[]
) {
  let subtotal = 0;
  let totalTax = 0;

  items.forEach(item => {
    const amount = item.quantity * item.unitPrice;
    const tax = Math.floor(amount * (item.taxRate / 100));
    subtotal += amount;
    totalTax += tax;
  });

  const summaryX = 350;
  const amountX = 450;

  doc.moveDown(2);
  doc.fontSize(12)
     .text('小計:', summaryX)
     .text(`¥${subtotal.toLocaleString()}`, amountX)
     .moveDown(0.5);

  doc.text('消費税:', summaryX)
     .text(`¥${totalTax.toLocaleString()}`, amountX)
     .moveDown(0.5);

  doc.fontSize(14)
     .text('合計金額:', summaryX)
     .text(`¥${(subtotal + totalTax).toLocaleString()}`, amountX);
}

// 備考欄の描画
function drawNotes(
  doc: PDFKit.PDFDocument,
  notes?: string | null
) {
  doc.moveDown(3);
  doc.fontSize(12);

  const notesY = doc.y;
  const notesHeight = 100;
  
  // 枠線付きの備考欄
  doc.rect(50, notesY, 490, notesHeight).stroke();
  doc.text('備考:', 60, notesY + 10);

  if (notes) {
    doc.text(notes, 60, notesY + 30, {
      width: 470,
      lineGap: 5,
      height: notesHeight - 40
    });
  }
}

// 支払い条件の描画
function drawPaymentTerms(
  doc: PDFKit.PDFDocument,
  invoice: InvoiceWithRelations
) {
  doc.moveDown(2);
  if (invoice.dueDate) {
    doc.text(`お支払期限: ${invoice.dueDate.toLocaleDateString('ja-JP')}`, {
      align: 'right'
    });
  }
}