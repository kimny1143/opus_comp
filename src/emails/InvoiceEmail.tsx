import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { Invoice } from '@/types/invoice'
import { formatDate } from '@/lib/utils/date'

interface InvoiceEmailProps {
  invoice: Invoice
  body: string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL

export const InvoiceEmail = ({
  invoice,
  body,
}: InvoiceEmailProps) => {
  const previewText = `請求書 ${invoice.invoiceNumber} のご送付`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Heading style={heading}>請求書</Heading>
          </Section>
          <Section style={content}>
            <Text style={paragraph}>
              {body.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </Text>
          </Section>
          <Hr style={hr} />
          <Section style={content}>
            <Text style={paragraph}>
              <strong>請求書の詳細</strong>
            </Text>
            <Text style={paragraph}>
              請求書番号: {invoice.invoiceNumber}
              <br />
              発行日: {formatDate(invoice.issueDate)}
              <br />
              支払期限: {formatDate(invoice.dueDate)}
              <br />
              請求金額: ¥{Number(invoice.totalAmount).toLocaleString()}
            </Text>
          </Section>
          <Hr style={hr} />
          <Section style={content}>
            <Text style={paragraph}>
              <strong>お支払い情報</strong>
            </Text>
            <Text style={paragraph}>
              銀行名: {invoice.bankInfo.bankName}
              <br />
              支店名: {invoice.bankInfo.branchName}
              <br />
              口座種別: {invoice.bankInfo.accountType === 'ordinary' ? '普通' : '当座'}
              <br />
              口座番号: {invoice.bankInfo.accountNumber}
              <br />
              口座名義: {invoice.bankInfo.accountHolder}
            </Text>
          </Section>
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={paragraph}>
              {invoice.template.contractorName}
              <br />
              {invoice.template.contractorAddress}
              <br />
              登録番号: {invoice.template.registrationNumber}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
}

const logo = {
  padding: '20px 0',
}

const heading = {
  fontSize: '32px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#484848',
}

const content = {
  padding: '20px 0',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.4',
  color: '#484848',
}

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
}

const footer = {
  padding: '20px 0',
  borderTop: '1px solid #cccccc',
  marginTop: '20px',
} 