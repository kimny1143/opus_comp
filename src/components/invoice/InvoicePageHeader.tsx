'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Printer } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ExtendedInvoice, SerializedInvoice } from '@/types/invoice'
import InvoicePdfButton from './InvoicePdfButton'
import { InvoiceEmailDialog } from './InvoiceEmailDialog'
import { motion } from 'framer-motion'
import { serializeDecimal } from '@/lib/utils/decimal-serializer'

interface InvoicePageHeaderProps {
  title: string
  invoice?: ExtendedInvoice
  isEdit?: boolean
  onPrint?: () => void
}

const buttonVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
}

export function InvoicePageHeader({ 
  title,
  invoice,
  isEdit,
  onPrint
}: InvoicePageHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
      <div className="flex items-center space-x-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">戻る</span>
          </Button>
        </motion.div>
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-2xl font-bold"
        >
          {title}
        </motion.h1>
      </div>
      <div className="flex items-center space-x-2">
        {invoice && !isEdit && (
          <>
            <motion.div
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={onPrint}
                className="hidden md:flex print-hide"
              >
                <Printer className="h-4 w-4 mr-2" />
                印刷
              </Button>
            </motion.div>
            <motion.div
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <InvoicePdfButton 
                invoice={{
                  ...serializeDecimal(invoice),
                  issuer: {
                    name: invoice.vendor.name,
                    registrationNumber: invoice.vendor.registrationNumber || '',
                    address: invoice.vendor.address || '',
                    tel: invoice.vendor.phone || undefined,
                    email: invoice.vendor.email || undefined
                  },
                  taxSummary: {
                    byRate: [],
                    totalTaxableAmount: invoice.totalAmount.toString(),
                    totalTaxAmount: invoice.items.reduce((sum, item) => 
                      sum + (item.quantity * Number(item.unitPrice) * Number(item.taxRate)), 0).toString()
                  }
                } as unknown as SerializedInvoice} 
              />
            </motion.div>
            <motion.div
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              <InvoiceEmailDialog 
                invoice={{
                  ...serializeDecimal(invoice),
                  issuer: {
                    name: invoice.vendor.name,
                    registrationNumber: invoice.vendor.registrationNumber || '',
                    address: invoice.vendor.address || '',
                    tel: invoice.vendor.phone || undefined,
                    email: invoice.vendor.email || undefined
                  },
                  taxSummary: {
                    byRate: [],
                    totalTaxableAmount: invoice.totalAmount.toString(),
                    totalTaxAmount: invoice.items.reduce((sum, item) => 
                      sum + (item.quantity * Number(item.unitPrice) * Number(item.taxRate)), 0).toString()
                  }
                } as unknown as SerializedInvoice} 
              />
            </motion.div>
          </>
        )}
        {isEdit && (
          <motion.div
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/invoices/${invoice.id}`)}
            >
              プレビュー
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
} 