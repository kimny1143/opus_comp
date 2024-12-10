import { PDFDocument, StandardFonts } from 'pdf-lib';

export async function createFont(pdfDoc: PDFDocument) {
  // 日本語フォントの読み込み
  // Note: 実際のプロダクションでは、適切な日本語フォントを使用する必要があります
  // ここでは一時的にStandardFontsを使用
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  return font;
}