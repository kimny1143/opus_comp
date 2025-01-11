'use client'

import { Button } from "@/components/ui/button"
import { Invoice } from "@/types/invoice"
import { formatDate } from "@/lib/utils/date"
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font } from '@react-pdf/renderer'
import { BlobProvider } from '@react-pdf/renderer'
import { ReactElement } from 'react'
import { calculateTaxByRate, TaxableItem } from '@/domains/invoice/tax'

// 日本語フォントの登録
Font.register({
  family: 'NotoSansJP',
  src: '/fonts/NotoSansJP-Regular.ttf',
})

Font.register({
  family: 'NotoSansJP-Bold',
  src: '/fonts/NotoSansJP-Bold.ttf',
})

interface InvoicePdfButtonProps {
  invoice: Invoice
  onGeneratePdf?: (invoice: Invoice) => void
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

// PDFドキュメントコンポーネント
const InvoicePDF = ({ invoice }: InvoicePdfButtonProps) => {
  const calculateSubtotal = (items: typeof invoice.items) => {
    return items.reduce((sum, item) => {
      const amount = Number(item.unitPrice) * item.quantity
      return sum + amount
    }, 0)
  }

  const calculateTaxTotal = (items: typeof invoice.items) => {
    const taxableItems: TaxableItem[] = items.map(item => ({
      taxRate: Number(item.taxRate),
      unitPrice: item.unitPrice,
      quantity: item.quantity
    }));
    const { totalTaxAmount } = calculateTaxByRate(taxableItems);
    return totalTaxAmount;
  }

  if (!invoice.bankInfo) {
    throw new Error('銀行情報が設定されていません');
  }

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
          <View>
            <Text style={styles.contractorInfo}>{invoice.template.contractorName}</Text>
            <Text style={styles.contractorInfo}>{invoice.template.contractorAddress}</Text>
            <Text style={styles.contractorInfo}>登録番号: {invoice.template.registrationNumber}</Text>
          </View>
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
          <Text style={styles.bankText}>銀行名: {invoice.bankInfo.bankName}</Text>
          <Text style={styles.bankText}>支店名: {invoice.bankInfo.branchName}</Text>
          <Text style={styles.bankText}>口座種別: {invoice.bankInfo.accountType === 'ordinary' ? '普通' : '当座'}</Text>
          <Text style={styles.bankText}>口座番号: {invoice.bankInfo.accountNumber}</Text>
          <Text style={styles.bankText}>口座名義: {invoice.bankInfo.accountHolder}</Text>
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
}

export function InvoicePdfButton({ invoice, onGeneratePdf }: InvoicePdfButtonProps) {
  return (
    <BlobProvider document={<InvoicePDF invoice={invoice} />}>
      {({ blob, url, loading, error }) => {
        if (loading) {
          return <Button disabled>PDFを生成中...</Button>
        }

        if (error) {
          return <Button disabled>エラーが発生しました</Button>
        }

        const handleClick = () => {
          if (onGeneratePdf) {
            onGeneratePdf(invoice)
          }
          // PDFのダウンロード処理
          if (blob) {
            const link = document.createElement('a')
            link.href = window.URL.createObjectURL(blob)
            link.download = `invoice-${invoice.invoiceNumber}.pdf`
            link.click()
          }
        }

        return (
          <Button onClick={handleClick}>
            PDFダウンロード
          </Button>
        )
      }}
    </BlobProvider>
  )
} 