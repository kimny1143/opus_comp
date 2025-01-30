'use client'

import React, { useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { BlobProvider } from '@react-pdf/renderer'
import { QualifiedInvoice, TaxableItem } from "@/types"
import { SerializedInvoice } from "@/types/invoice"
import { formatDate } from "@/lib/utils/date"
import { calculateTaxSummary } from '@/domains/invoice/tax'
import { Decimal } from '@prisma/client/runtime/library'
import { convertBankInfoToString } from '@/lib/utils/bankInfo'

// 日本語フォントの登録
Font.register({
  family: 'NotoSansJP',
  src: 'https://fonts.gstatic.com/ea/notosansjp/v5/NotoSansJP-Regular.ttf',
})

Font.register({
  family: 'NotoSansJP-Bold',
  src: 'https://fonts.gstatic.com/ea/notosansjp/v5/NotoSansJP-Bold.ttf',
})

interface InvoicePdfButtonProps {
  invoice: QualifiedInvoice | SerializedInvoice
  onGeneratePdf?: (pdfBlob: Blob) => void
}

// スタイルの定義
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'NotoSansJP',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'NotoSansJP-Bold',
    marginBottom: 10,
  },
  headerInfo: {
    fontSize: 10,
  },
  contractorInfo: {
    fontSize: 10,
    textAlign: 'right',
  },
  vendorInfo: {
    marginTop: 20,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9fafb',
  },
  vendorTitle: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Bold',
    marginBottom: 5,
  },
  vendorText: {
    fontSize: 10,
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
  },
  tableCellRight: {
    flex: 1,
    fontSize: 10,
    textAlign: 'right',
  },
  totalSection: {
    width: '40%',
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9fafb',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    fontSize: 10,
  },
  totalRowBold: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 5,
    marginTop: 5,
    fontSize: 10,
    fontFamily: 'NotoSansJP-Bold',
  },
  bankInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9fafb',
  },
  bankTitle: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Bold',
    marginBottom: 5,
  },
  bankText: {
    fontSize: 10,
    marginBottom: 3,
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9fafb',
  },
})

const InvoicePDF = React.memo<{ invoice: QualifiedInvoice | SerializedInvoice }>(({ invoice: rawInvoice }) => {
  // 日付の型変換
  const invoice = {
    ...rawInvoice,
    issueDate: typeof rawInvoice.issueDate === 'string' ? new Date(rawInvoice.issueDate) : rawInvoice.issueDate,
    dueDate: typeof rawInvoice.dueDate === 'string' ? new Date(rawInvoice.dueDate) : rawInvoice.dueDate,
  };

  const calculateSubtotal = useCallback((items: typeof invoice.items) => {
    return items.reduce((sum, item) => {
      const amount = Number(item.unitPrice) * item.quantity
      return sum + amount
    }, 0)
  }, [])

  const calculateTaxTotal = useCallback((items: typeof invoice.items) => {
    const taxableItems: TaxableItem[] = items.map(item => ({
      taxRate: Number(item.taxRate),
      unitPrice: new Decimal(item.unitPrice),
      quantity: item.quantity
    }));
    const { totalTaxAmount } = calculateTaxSummary(taxableItems);
    return totalTaxAmount;
  }, [])

  if (!invoice.bankInfo) {
    throw new Error('銀行情報が設定されていません');
  }

  const bankInfo = convertBankInfoToString(invoice.bankInfo);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>請求書</Text>
            <Text style={styles.headerInfo}>請求書番号: {invoice.invoiceNumber}</Text>
            <Text style={styles.headerInfo}>発行日: {formatDate(invoice.issueDate)}</Text>
            <Text style={styles.headerInfo}>支払期限: {formatDate(invoice.dueDate)}</Text>
          </View>
          {invoice.template && (
            <View>
              <Text style={styles.contractorInfo}>{invoice.template.contractorName}</Text>
              <Text style={styles.contractorInfo}>{invoice.template.contractorAddress}</Text>
              <Text style={styles.contractorInfo}>登録番号: {invoice.template.registrationNumber}</Text>
            </View>
          )}
        </View>

        <View style={styles.vendorInfo}>
          <Text style={styles.vendorTitle}>請求先</Text>
          <Text style={styles.vendorText}>{invoice.vendor.name}</Text>
          <Text style={styles.vendorText}>{invoice.vendor.address}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>品目</Text>
            <Text style={styles.tableCellRight}>数量</Text>
            <Text style={styles.tableCellRight}>単価</Text>
            <Text style={styles.tableCellRight}>税率</Text>
            <Text style={styles.tableCellRight}>金額</Text>
          </View>
          {invoice.items.map((item, index) => {
            const amount = Number(item.unitPrice) * item.quantity
            return (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.itemName}</Text>
                <Text style={styles.tableCellRight}>{item.quantity}</Text>
                <Text style={styles.tableCellRight}>¥{Number(item.unitPrice).toLocaleString()}</Text>
                <Text style={styles.tableCellRight}>{Number(item.taxRate) * 100}%</Text>
                <Text style={styles.tableCellRight}>¥{amount.toLocaleString()}</Text>
              </View>
            )
          })}
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text>小計:</Text>
            <Text>¥{calculateSubtotal(invoice.items).toLocaleString()}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>消費税:</Text>
            <Text>¥{calculateTaxTotal(invoice.items).toLocaleString()}</Text>
          </View>
          <View style={styles.totalRowBold}>
            <Text>合計:</Text>
            <Text>¥{Number(invoice.totalAmount).toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.bankInfo}>
          <Text style={styles.bankTitle}>お支払い情報</Text>
          <Text style={styles.bankText}>銀行名: {bankInfo.bankName}</Text>
          <Text style={styles.bankText}>支店名: {bankInfo.branchName}</Text>
          <Text style={styles.bankText}>口座種別: {bankInfo.accountType}</Text>
          <Text style={styles.bankText}>口座番号: {bankInfo.accountNumber}</Text>
          <Text style={styles.bankText}>口座名義: {bankInfo.accountHolder}</Text>
        </View>

        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.bankTitle}>備考</Text>
            <Text style={styles.bankText}>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
})

InvoicePDF.displayName = 'InvoicePDF'

const InvoicePdfButton: React.FC<InvoicePdfButtonProps> = ({ invoice, onGeneratePdf }) => {
  const handleClick = useCallback((url: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice_${invoice.invoiceNumber || invoice.id}.pdf`
    link.click()
    if (onGeneratePdf) {
      onGeneratePdf(new Blob())
    }
  }, [invoice, onGeneratePdf])

  if (!invoice.bankInfo) {
    return (
      <Button disabled title="銀行情報が設定されていません">
        PDF出力
      </Button>
    )
  }

  return (
    <BlobProvider document={<InvoicePDF invoice={invoice} />}>
      {({ url, loading, error }) => {
        if (loading) {
          return <Button disabled>PDFを生成中...</Button>
        }

        if (error || !url) {
          return <Button disabled>PDFの生成に失敗しました</Button>
        }

        return (
          <Button onClick={() => handleClick(url)}>
            PDFをダウンロード
          </Button>
        )
      }}
    </BlobProvider>
  )
}

export default InvoicePdfButton
