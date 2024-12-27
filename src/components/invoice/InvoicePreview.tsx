'use client'

import { useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { Invoice } from '@/types/invoice';
import { InvoicePDF } from './InvoicePDF';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface InvoicePreviewProps {
  invoice: Invoice;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">
          プレビュー
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <PDFViewer width="100%" height="100%" className="rounded-lg">
          <InvoicePDF invoice={invoice} />
        </PDFViewer>
      </DialogContent>
    </Dialog>
  );
}; 