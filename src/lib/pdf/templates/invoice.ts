import PDFDocument from 'pdfkit';
import { Invoice, InvoiceItem, Vendor } from '@prisma/client';
import { Prisma } from '@prisma/client';
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
  registrationNumber?: string;  // インボイス制度の登録番号
}

// 税率区分の定義
const TAX_RATE_LABELS = {
  0.1: '標準税率(10%)',
  0.08: '軽減税率(8%)'
} as const;

type TaxRateKey = keyof typeof TAX_RATE_LABELS;

interface TaxRateSummary {
  taxRate: TaxRateKey;
  subtotal: Prisma.Decimal;
  tax: Prisma.Decimal;
}

// カスタムエラー定義
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
    drawInvoiceInfo(doc, invoice, companyInfo);
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
  invoice: InvoiceWithRelations,
  companyInfo: CompanyInfo
) {
  // 適格請求書等の表示
  doc.fontSize(24).text('請求書', { align: 'center' });
  if (companyInfo.registrationNumber) {
    doc.fontSize(10).text('※適格請求書等', { align: 'center' });
  }
  
  doc.moveDown();
  
  // 基本情報(右寄せ)
  doc.fontSize(12)
     .text(`請求書番号: ${invoice.invoiceNumber}`, { align: 'right' })
     .text(`発行日: ${invoice.issueDate.toLocaleDateString('ja-JP')}`, { align: 'right' });

  // 登録番号の表示
  if (companyInfo.registrationNumber) {
    doc.text(`登録番号: ${companyInfo.registrationNumber}`, { align: 'right' });
  }

  doc.moveDown();
  
  // 請求先情報(左寄せ)
  doc.fontSize(14).text('請求先:', { continued: true });
  doc.fontSize(12).text(invoice.vendor.name);
  if (invoice.vendor.address) {
    doc.text(invoice.vendor.address);
  }
  
  // 取引先の登録番号表示
  if (invoice.vendor.registrationNumber) {
    doc.text(`登録番号: ${invoice.vendor.registrationNumber}`);
  }
}

// 明細テーブルの描画
function drawItemsTable(
  doc: PDFKit.PDFDocument,
  items: InvoiceItem[]
) {
  const columns = {
    item: { x: 50, w: 200 },
    quantity: { x: 250, w: 60 },
    price: { x: 310, w: 70 },
    taxRate: { x: 380, w: 70 },
    amount: { x: 450, w: 90 }
  };

  // ヘッダー行
  doc.fontSize(10);
  const tableTop = doc.y;
  doc
    .text('品目', columns.item.x, tableTop)
    .text('数量', columns.quantity.x, tableTop)
    .text('単価', columns.price.x, tableTop)
    .text('税率', columns.taxRate.x, tableTop)
    .text('金額', columns.amount.x, tableTop);

  // 区切り線
  doc.moveTo(50, doc.y + 5)
     .lineTo(540, doc.y + 5)
     .stroke();

  // 明細行
  const lineHeight = 20;
  items.forEach((item, i) => {
    const y = doc.y + lineHeight;
    const amount = new Prisma.Decimal(item.quantity).mul(item.unitPrice);
    const taxRateValue = Number(item.taxRate);
    const taxRateLabel = TAX_RATE_LABELS[taxRateValue as TaxRateKey] || `${taxRateValue * 100}%`;

    doc
      .text(item.itemName, columns.item.x, y, { width: columns.item.w })
      .text(item.quantity.toString(), columns.quantity.x, y)
      .text(`¥${item.unitPrice.toFixed(0)}`, columns.price.x, y)
      .text(taxRateLabel, columns.taxRate.x, y)
      .text(`¥${amount.toFixed(0)}`, columns.amount.x, y);

    // 品目説明がある場合は追加行に表示
    if (item.description) {
      doc.fontSize(8)
         .text(item.description, columns.item.x, y + 12, {
           width: columns.item.w,
           height: lineHeight - 12
         });
    }

    doc.y = y + (item.description ? lineHeight : 0);
  });
} 

// 金額サマリーの描画
function drawSummary(
  doc: PDFKit.PDFDocument,
  items: InvoiceItem[]
) {
  // 税率区分ごとの集計
  const taxRateSummaries = items.reduce<TaxRateSummary[]>((acc, item) => {
    const taxRateValue = Number(item.taxRate);
    const amount = new Prisma.Decimal(item.quantity).mul(item.unitPrice);
    const tax = amount.mul(new Prisma.Decimal(taxRateValue));
    
    const existingSummary = acc.find(s => s.taxRate === taxRateValue);
    if (existingSummary) {
      existingSummary.subtotal = existingSummary.subtotal.add(amount);
      existingSummary.tax = existingSummary.tax.add(tax);
    } else {
      acc.push({
        taxRate: taxRateValue as TaxRateKey,
        subtotal: amount,
        tax: tax
      });
    }
    return acc;
  }, []);

  const summaryX = 350;
  const amountX = 450;
  const totalSubtotal = taxRateSummaries.reduce((acc, s) => acc.add(s.subtotal), new Prisma.Decimal(0));
  const totalTax = taxRateSummaries.reduce((acc, s) => acc.add(s.tax), new Prisma.Decimal(0));

  // 小計
  doc.moveDown(2);
  doc.fontSize(12)
     .text('小計:', summaryX)
     .text(`¥${totalSubtotal.toFixed(0)}`, amountX)
     .moveDown(0.5);

  // 税率区分ごとの消費税
  taxRateSummaries.forEach(summary => {
    const label = TAX_RATE_LABELS[summary.taxRate];
    doc.text(`消費税(${label}):`, summaryX)
       .text(`¥${summary.tax.toFixed(0)}`, amountX)
       .moveDown(0.5);
  });

  // 合計金額
  doc.fontSize(14)
     .text('合計金額:', summaryX)
     .text(`¥${totalSubtotal.add(totalTax).toFixed(0)}`, amountX);

  // 適格請求書等の注記
  doc.moveDown();
  doc.fontSize(8)
     .text('※ 軽減税率対象品目には軽減税率(8%)が適用されています。', {
       align: 'right'
     });
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