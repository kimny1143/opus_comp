'use client'

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Invoice } from '@/types/invoice';
import { formatCurrency } from '@/lib/utils/format';
import { AccountType, deserializeBankInfo } from '@/types/bankInfo';

// 日本語フォントの登録
Font.register({
  family: 'NotoSansJP',
  src: '/fonts/NotoSansJP-Regular.ttf'
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'NotoSansJP'
  },
  header: {
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center'
  },
  info: {
    fontSize: 10,
    marginBottom: 20
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginBottom: 20,
    flexDirection: 'column'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 24,
    width: '100%'
  },
  tableHeader: {
    backgroundColor: '#f0f0f0'
  },
  tableCell: {
    padding: 5
  },
  descriptionCell: {
    width: '40%'
  },
  numberCell: {
    width: '15%',
    textAlign: 'right'
  },
  total: {
    marginTop: 20,
    alignItems: 'flex-end'
  },
  bankInfo: {
    marginTop: 30,
    fontSize: 10
  }
});

const getAccountTypeLabel = (type: AccountType): string => {
  switch (type) {
    case AccountType.ORDINARY:
      return '普通';
    case AccountType.CURRENT:
      return '当座';
    case AccountType.SAVINGS:
      return '貯蓄';
    default:
      return type;
  }
};

export const InvoicePDF: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  // 小計と税額の計算
  const subTotal = invoice.items.reduce((sum, item) => 
    sum + (Number(item.unitPrice) * item.quantity), 0
  )
  const taxTotal = invoice.items.reduce((sum, item) => 
    sum + (Number(item.unitPrice) * item.quantity * Number(item.taxRate) / 100), 0
  )

  // bankInfoのデシリアライズ
  const bankInfo = invoice.bankInfo ? deserializeBankInfo(JSON.parse(invoice.bankInfo as string)) : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>請求書</Text>
          <Text>請求書番号: {invoice.invoiceNumber}</Text>
          <Text>発行日: {invoice.issueDate.toLocaleDateString()}</Text>
          <Text>支払期限: {invoice.dueDate.toLocaleDateString()}</Text>
        </View>

        {/* 事業者情報 */}
        <View style={styles.info}>
          <Text>事業者名: {invoice.vendor.name}</Text>
          <Text>登録番号: {invoice.vendor.registrationNumber}</Text>
          <Text>住所: {invoice.vendor.address}</Text>
        </View>

        {/* 請求項目テーブル */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.descriptionCell]}>内容</Text>
            <Text style={[styles.tableCell, styles.numberCell]}>数量</Text>
            <Text style={[styles.tableCell, styles.numberCell]}>単価</Text>
            <Text style={[styles.tableCell, styles.numberCell]}>税率</Text>
            <Text style={[styles.tableCell, styles.numberCell]}>金額</Text>
          </View>
          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.descriptionCell]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCell, styles.numberCell]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.numberCell]}>
                {formatCurrency(Number(item.unitPrice))}
              </Text>
              <Text style={[styles.tableCell, styles.numberCell]}>
                {Number(item.taxRate)}%
              </Text>
              <Text style={[styles.tableCell, styles.numberCell]}>
                {formatCurrency(Number(item.unitPrice) * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* 合計金額 */}
        <View style={styles.total}>
          <Text>小計: {formatCurrency(subTotal)}</Text>
          <Text>消費税: {formatCurrency(taxTotal)}</Text>
          <Text style={{ fontWeight: 'bold' }}>
            合計: {formatCurrency(subTotal + taxTotal)}
          </Text>
        </View>

        {/* 銀行情報 */}
        {bankInfo && (
          <View style={styles.bankInfo}>
            <Text>お振込先</Text>
            <Text>銀行名: {bankInfo.bankName}</Text>
            <Text>支店名: {bankInfo.branchName}</Text>
            <Text>口座種別: {getAccountTypeLabel(bankInfo.accountType)}</Text>
            <Text>口座番号: {bankInfo.accountNumber}</Text>
            <Text>口座名義: {bankInfo.accountHolder}</Text>
          </View>
        )}

        {/* 備考 */}
        {invoice.notes && (
          <View style={{ marginTop: 30 }}>
            <Text style={{ fontSize: 10 }}>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}; 