import type { MailTemplateType, MailContext } from '@/lib/mail/types'

declare module '@/lib/mail' {
  export function sendEmail<T extends MailTemplateType>(
    to: string,
    templateType: T,
    context: MailContext[T]
  ): Promise<void>
} 