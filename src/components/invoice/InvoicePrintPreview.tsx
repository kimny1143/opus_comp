'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExtendedInvoice } from '@/types/invoice';
import { InvoiceDetail } from './InvoiceDetail';
import { Eye, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { buttonVariants, fadeInVariants } from '@/lib/utils/animation';

interface InvoicePrintPreviewProps {
  invoice: ExtendedInvoice;
  onPrint: () => void;
}

export function InvoicePrintPreview({ invoice, onPrint }: InvoicePrintPreviewProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div variants={buttonVariants} initial="initial" animate="animate" whileHover="hover" whileTap="tap">
          <Button variant="outline" size="sm" className="print-hide">
            <Eye className="h-4 w-4 mr-2" />
            プレビュー
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>印刷プレビュー</span>
            <Button variant="outline" size="sm" onClick={onPrint} className="print-hide">
              <Printer className="h-4 w-4 mr-2" />
              印刷
            </Button>
          </DialogTitle>
        </DialogHeader>
        <motion.div
          variants={fadeInVariants}
          initial="initial"
          animate="animate"
          className="preview-content"
        >
          <InvoiceDetail invoice={invoice} />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
} 