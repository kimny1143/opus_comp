'use client'

import { useState } from 'react';
import { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BlobProvider } from '@react-pdf/renderer';
import { InvoicePDF } from './InvoicePDF';

interface InvoiceEmailDialogProps {
  invoice: Invoice;
}

export const InvoiceEmailDialog: React.FC<InvoiceEmailDialogProps> = ({ invoice }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState(
    `${invoice.template.contractorName} 様\n\n` +
    `請求書（${invoice.invoiceNumber}）を送付いたします。\n` +
    `ご確認のほど、よろしくお願いいたします。\n\n` +
    `支払期限: ${invoice.dueDate.toLocaleDateString()}\n` +
    `請求金額: ¥${invoice.totalAmount.toLocaleString()}`
  );
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async (pdfBlob: Blob) => {
    try {
      setIsSending(true);
      const response = await fetch('/api/invoice/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice: {
            ...invoice,
            pdfBlob: await pdfBlob.arrayBuffer()
          },
          recipientEmail,
          message
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('メールを送信しました');
        setIsOpen(false);
      } else {
        throw new Error(data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      alert('メール送信に失敗しました: ' + errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">
          メール送信
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>請求書をメールで送信</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              送信先メールアドレス
            </label>
            <Input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="example@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              メッセージ
            </label>
            <Textarea
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
              rows={6}
            />
          </div>
          <BlobProvider document={<InvoicePDF invoice={invoice} />}>
            {({ blob, loading }) => (
              <Button
                className="w-full"
                onClick={() => blob && handleSendEmail(blob)}
                disabled={loading || isSending || !recipientEmail}
              >
                {isSending ? '送信中...' : '送信'}
              </Button>
            )}
          </BlobProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 