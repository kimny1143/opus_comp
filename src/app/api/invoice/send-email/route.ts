import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { Invoice } from '@/types/invoice';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { invoice, recipientEmail, message } = await request.json();

    const response = await resend.emails.send({
      from: 'no-reply@your-domain.com',
      to: recipientEmail,
      subject: `請求書 ${invoice.invoiceNumber}`,
      html: `
        <div>
          <p>${message}</p>
          <p>請求書番号: ${invoice.invoiceNumber}</p>
          <p>発行日: ${invoice.issuedDate.toLocaleDateString()}</p>
          <p>支払期限: ${invoice.dueDate.toLocaleDateString()}</p>
          <p>合計金額: ¥${invoice.total.toLocaleString()}</p>
        </div>
      `,
      attachments: [
        {
          filename: `請求書_${invoice.invoiceNumber}.pdf`,
          content: invoice.pdfBlob
        }
      ]
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 