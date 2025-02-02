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
import { PdfInvoice, PdfCompanyInfo } from '@/lib/pdf/types';

interface InvoicePreviewModalProps {
  open: boolean;
  onClose: () => void;
  invoice: QualifiedInvoice;
  companyInfo: PdfCompanyInfo;
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
      if (!pdfInvoice) {
        throw new Error('請求書データの変換に失敗しました');
      }

      await generateInvoicePDF(doc, pdfInvoice, companyInfo);
      doc.end();

      // BufferからBlobを作成
      const pdfBlob = new Blob([Buffer.concat(chunks)], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

    } catch (error) {
      console.error('PDF生成エラー:', error);
      toast({
        title: 'PDFの生成に失敗しました',
        description: error instanceof Error ? error.message : 'もう一度お試しください',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    try {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `請求書_${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('ダウンロードエラー:', error);
      toast({
        title: 'ダウンロードに失敗しました',
        description: 'もう一度お試しください',
        variant: 'destructive'
      });
    }
  };

  const handlePrint = () => {
    if (!pdfUrl) return;

    try {
      // 印刷用のiframeを作成
      const printFrame = document.createElement('iframe');
      printFrame.style.display = 'none';
      printFrame.src = pdfUrl;
      document.body.appendChild(printFrame);

      printFrame.onload = () => {
        try {
          if (!printFrame.contentWindow) {
            throw new Error('印刷用ウィンドウの作成に失敗しました');
          }
          printFrame.contentWindow.print();
        } catch (error) {
          console.error('印刷エラー:', error);
          toast({
            title: '印刷の準備に失敗しました',
            description: error instanceof Error ? error.message : 'もう一度お試しください',
            variant: 'destructive'
          });
        }
        // 印刷ダイアログが閉じられた後にiframeを削除
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      };
    } catch (error) {
      console.error('印刷エラー:', error);
      toast({
        title: '印刷の準備に失敗しました',
        description: error instanceof Error ? error.message : 'もう一度お試しください',
        variant: 'destructive'
      });
    }
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