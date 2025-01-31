import { MailTemplateType, MailContext } from './types'

export async function mockSendEmail<T extends MailTemplateType>(
  to: string,
  templateType: T,
  context: MailContext[T]
): Promise<void> {
  console.log('Mock email sent:', {
    to,
    templateType,
    context
  })
}