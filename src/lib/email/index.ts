type EmailTemplate = 'orderCreated' | 'orderUpdated';

interface EmailData {
  orderNumber?: string;
  vendorName?: string;
  [key: string]: any;
}

export async function sendEmail(
  to: string,
  template: EmailTemplate,
  data: EmailData
) {
  // TODO: 実際のメール送信処理を実装
  console.log('Sending email:', { to, template, data });
} 