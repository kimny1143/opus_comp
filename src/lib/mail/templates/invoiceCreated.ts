import { MailTemplate, MailRenderResult } from '../types';
import { generateInvoicePDF } from '@/lib/pdf/templates/invoice';
import { convertToPdfInvoice } from '@/lib/pdf/utils';
import PDFDocument from 'pdfkit';

/**
 * 請求書作成通知メールのテンプレート
 */
export const invoiceCreatedTemplate: MailTemplate<'invoiceCreated'> = {
  type: 'invoiceCreated',
  render: async ({ invoice, companyInfo }) => {
    // PDFの生成
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    doc.on('data', chunk => chunks.push(chunk));

    // PDFの生成(型変換を行ってから渡す)
    const pdfInvoice = convertToPdfInvoice(invoice);
    await generateInvoicePDF(doc, pdfInvoice, {
      name: companyInfo.name,
      postalCode: '',
      address: '',
      tel: '',
      email: companyInfo.email,
      registrationNumber: companyInfo.registrationNumber
    });

    doc.end();

    // Bufferの結合
    const pdfBuffer = Buffer.concat(chunks);

    // メール本文の生成
    const body = `
${companyInfo.name} 様

請求書が作成されました。

請求書番号: ${invoice.invoiceNumber}
発行日: ${invoice.issueDate.toLocaleDateString()}
金額: ¥${invoice.totalAmount.toLocaleString()}

添付のPDFをご確認ください。

※このメールは自動送信されています。
    `.trim();

    return {
      subject: `請求書[${invoice.invoiceNumber}]が作成されました`,
      body,
      attachments: [
        {
          filename: `invoice_${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer
        }
      ]
    };
  }
};