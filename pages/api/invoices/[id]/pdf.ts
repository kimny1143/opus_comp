import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { validationMessages as msg } from '@/lib/validations/messages';
import PDFDocument from 'pdfkit';
import { generateInvoicePDF, PDFGenerationError } from '@/lib/pdf/templates/invoice';
import path from 'path';

// 会社情報の設定
const companyInfo = {
  name: '株式会社サンプル',
  postalCode: '〒123-4567',
  address: '東京都渋谷区サンプル1-2-3',
  tel: '03-1234-5678',
  email: 'info@example.com',
  logoPath: path.join(process.cwd(), process.env.COMPANY_LOGO_PATH || '')
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ message: msg.auth.required });
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // 請求書の存在と権限チェック
      const invoice = await prisma.invoice.findFirst({
        where: { 
          id: id as string,
          createdBy: session.user.id 
        },
        include: {
          vendor: true,
          items: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!invoice) {
        return res.status(404).json({ message: msg.invoice.notFound });
      }

      // PDFドキュメントの作成
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `請求書_${invoice.invoiceNumber}`,
          Author: invoice.vendor.name,
          Subject: '請求書',
        }
      });

      // レスポンスヘッダーの�定
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=invoice_${invoice.invoiceNumber}.pdf
`      );

      // PDFストリームをレスポンスにパイプ
      doc.pipe(res);

      // ヘンプレートを使用してPDFを生成
      await generateInvoicePDF(doc, invoice, companyInfo);
    } catch (error) {
      console.error('PDF generation error:', error);
      
      if (error instanceof PDFGenerationError) {
        return res.status(400).json({ 
          message: error.message,
          details: error.cause ? String(error.cause) : undefined
        });
      }

      const unknownError = error as Error;
      return res.status(500).json({ 
        message: msg.error.system,
        details: process.env.NODE_ENV === 'development' ? unknownError.message : undefined
      });
    }
  }

  return res.status(405).json({ message: msg.error.methodNotAllowed });
} 