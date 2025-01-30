'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { SerializedInvoice } from '@/types/invoice'
import { Mail } from 'lucide-react'

interface InvoiceEmailDialogProps {
  invoice: SerializedInvoice
}

export function InvoiceEmailDialog({ invoice }: InvoiceEmailDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState(`請求書 ${invoice.invoiceNumber}`)
  const [message, setMessage] = useState('')
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/invoices/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          email,
          subject,
          message,
        }),
      })

      if (!response.ok) {
        throw new Error('メールの送信に失敗しました')
      }

      toast({
        title: '成功',
        description: 'メールを送信しました',
      })
      setIsOpen(false)
    } catch (error) {
      console.error('Error sending email:', error)
      toast({
        title: 'エラー',
        description: 'メールの送信に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Mail className="h-4 w-4 mr-2" />
          メール送信
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>請求書をメールで送信</DialogTitle>
          <DialogDescription>
            請求書をPDFファイルとして添付し、指定したメールアドレスに送信します。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              送信先メールアドレス
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              件名
            </label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              メッセージ
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '送信中...' : '送信'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
