import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateInvoicePDF } from '@/lib/pdf/templates/invoice';
import { convertToPdfInvoice } from '@/lib/pdf/utils';
import PDFDocument from 'pdfkit';
import { QualifiedInvoice } from '@/types/invoice';
import { PdfInvoice } from '@/lib/pdf/types';

interface InvoicePreviewModalProps {
  open: boolean;
  onClose: () => void;
  invoice: QualifiedInvoice;
  companyInfo: {
    name: string;
    postalCode: string;
    address: string;
    tel: string;
    email: string;
    registrationNumber?: string;
  };
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  open,
  onClose,
  invoice,
  companyInfo
}) => {
  const { toast } = useToast();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      generatePreview();
    } else {
      // モーダルが閉じられたらURLを解放
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    }
  }, [open, invoice]);

  const generatePreview = async () => {
    setLoading(true);
    try {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `請求書_${invoice.invoiceNumber}`,
          Author: companyInfo.name,
          Subject: '請求書',
          Keywords: 'invoice, 請求書',
          CreationDate: new Date()
        }
      });

      // Bufferに書き出し
      doc.on('data', chunks.push.bind(chunks));
      
      // PDFの生成
      const pdfInvoice = convertToPdfInvoice(invoice);
      await generateInvoicePDF(doc, pdfInvoice, {
        name: companyInfo.name,
        postalCode: '',  // 必要に応じて追加
        address: '',     // 必要に応じて追加
        tel: '',        // 必要に応じて追加
        email: companyInfo.email,
        registrationNumber: companyInfo.registrationNumber
      });
      doc.end();

      // BufferからBlobを作成
      const pdfBlob = new Blob([Buffer.concat(chunks)], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

    } catch (error) {
      console.error('PDF生成エラー:', error);
      toast({
        title: 'PDFの生成に失敗しました',
        description: 'もう一度お試しください',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `請求書_${invoice.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!pdfUrl) return;

    // 印刷用のiframeを作成
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    printFrame.src = pdfUrl;
    document.body.appendChild(printFrame);

    printFrame.onload = () => {
      try {
        printFrame.contentWindow?.print();
      } catch (error) {
        console.error('印刷エラー:', error);
        toast({
          title: '印刷の準備に失敗しました',
          description: 'もう一度お試しください',
          variant: 'destructive'
        });
      }
      // 印刷ダイアログが閉じられた後にiframeを削除
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    };
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>請求書プレビュー</DialogTitle>
      </DialogHeader>
      <DialogContent className="max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">PDFを生成中...</span>
          </div>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="w-full h-[calc(100vh-300px)] border rounded"
            title="PDF Preview"
          />
        ) : null}
      </DialogContent>
      <DialogFooter className="sm:justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={!pdfUrl || loading}
          >
            <Download className="mr-2 h-4 w-4" />
            ダウンロード
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={!pdfUrl || loading}
          >
            <Printer className="mr-2 h-4 w-4" />
            印刷
          </Button>
        </div>
        <Button variant="secondary" onClick={onClose}>
          閉じる
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default InvoicePreviewModal;