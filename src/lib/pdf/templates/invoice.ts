import PDFDocument from 'pdfkit';
import { Prisma } from '@prisma/client';
import path from 'path';
import { promises as fs } from 'fs';
import { ItemCategory, ITEM_CATEGORY_LABELS } from '@/types/itemCategory';
import { PdfInvoice, PdfInvoiceItem } from '@/lib/pdf/types';

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
  invoice: PdfInvoice,
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
    drawSummary(doc, invoice);
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
  invoice: PdfInvoice,
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
  items: PdfInvoiceItem[]
) {
  // テキストの色を設定する関数
  const setTextColor = (doc: PDFKit.PDFDocument, isReducedTax: boolean) => {
    doc.fillColor(isReducedTax ? '#2563eb' : '#000000');
  };

  const columns = {
    item: { x: 50, w: 150 },
    category: { x: 200, w: 80 },
    quantity: { x: 280, w: 50 },
    price: { x: 330, w: 70 },
    taxRate: { x: 400, w: 60 },
    amount: { x: 460, w: 80 }
  };

  // ヘッダー行
  doc.fontSize(10);
  const tableTop = doc.y;
  doc
    .text('品目', columns.item.x, tableTop)
    .text('区分', columns.category.x, tableTop)
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
  items.forEach((item) => {
    const y = doc.y + lineHeight;
    const taxRateValue = Number(item.taxRate);
    const taxRateLabel = TAX_RATE_LABELS[taxRateValue as TaxRateKey] || `${taxRateValue * 100}%`;

    // 品目カテゴリーのラベルを取得
    const categoryLabel = item.category ? ITEM_CATEGORY_LABELS[item.category] : '未分類';
    const isReducedTax = taxRateValue === 0.08;

    doc.text(item.itemName, columns.item.x, y, { width: columns.item.w });

    setTextColor(doc, isReducedTax);
    doc.text(categoryLabel, columns.category.x, y, { width: columns.category.w });
    doc.text(item.quantity.toString(), columns.quantity.x, y);
    doc.text(`¥${item.unitPrice.toFixed(0)}`, columns.price.x, y);
    doc.text(taxRateLabel, columns.taxRate.x, y);
    doc.text(`¥${item.taxableAmount.toFixed(0)}`, columns.amount.x, y);
    setTextColor(doc, false);

    // 品目説明がある場合は追加行に表示
    if (item.description) {
      doc.fontSize(8)
         .fillColor('#666666') // 説明文は灰色で表示
         .text(item.description, columns.item.x, y + 12, {
           width: columns.item.w + columns.category.w, // 説明文は2列分の幅で表示
           height: lineHeight - 12
         })
         .fillColor('#000000'); // 色を元に戻す
    }

    doc.y = y + (item.description ? lineHeight : 0);
  });
}

// 金額サマリーの描画
function drawSummary(
  doc: PDFKit.PDFDocument,
  invoice: PdfInvoice
) {
  const summaryX = 350;
  const amountX = 450;

  // 小計
  doc.moveDown(2);
  doc.fontSize(12)
     .text('小計:', summaryX)
     .text(`¥${invoice.subtotal.toFixed(0)}`, amountX)
     .moveDown(0.5);

  // 税率区分ごとの消費税(カテゴリー情報付き)
  const taxRateGroups = invoice.items.reduce<Map<number, PdfInvoiceItem[]>>((acc, item) => {
    const rate = Number(item.taxRate);
    if (!acc.has(rate)) {
      acc.set(rate, []);
    }
    acc.get(rate)?.push(item);
    return acc;
  }, new Map());

  // Mapをエントリーの配列に変換して反復処理
  for (const [rate, items] of Array.from(taxRateGroups.entries())) {
    const isReducedTax = rate === 0.08;
    const label = TAX_RATE_LABELS[rate as TaxRateKey];
    const taxAmount = items.reduce((sum, item) => sum.add(item.taxAmount), new Prisma.Decimal(0));
    
    doc.fillColor(isReducedTax ? '#2563eb' : '#000000');
    doc.text(`消費税(${label}):`, summaryX)
       .text(`¥${taxAmount.toFixed(0)}`, amountX)
       .moveDown(0.5);

    // カテゴリー情報の表示
    const categories = new Set(items.map(item => item.category).filter((c): c is ItemCategory => !!c));
    if (categories.size > 0) {
      doc.fontSize(8)
         .text(`対象品目: ${Array.from(categories).map(cat => ITEM_CATEGORY_LABELS[cat]).join('、')}`, {
           width: 300,
           align: 'right'
         })
         .moveDown(0.5);
    }
    doc.fillColor('#000000');
  }

  // 合計金額
  doc.fontSize(14)
     .text('合計金額:', summaryX)
     .text(`¥${invoice.totalAmount.toFixed(0)}`, amountX);

  // インボイス制度対応の注記
  doc.moveDown();
  doc.fontSize(8);

  // 軽減税率対象品目がある場合の注記
  const hasReducedTaxItems = invoice.items.some(item => Number(item.taxRate) === 0.08);
  if (hasReducedTaxItems) {
    doc.text('※ 軽減税率対象品目には軽減税率(8%)が適用されています。', {
      align: 'right'
    });
  }

  // 適格請求書等の注記
  doc.text('※ この請求書は「適格請求書等保存方式」に対応した請求書です。', {
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
  invoice: PdfInvoice
) {
  doc.moveDown(2);
  if (invoice.dueDate) {
    doc.text(`お支払期限: ${invoice.dueDate.toLocaleDateString('ja-JP')}`, {
      align: 'right'
    });
  }
}