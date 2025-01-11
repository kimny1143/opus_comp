'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Invoice } from "@/types/invoice"

interface InvoiceEmailDialogProps {
  invoice: Invoice
}

export function InvoiceEmailDialog({ invoice }: InvoiceEmailDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    try {
      const response = await fetch('/api/invoices/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          email: email,
        }),
      })

      if (!response.ok) {
        throw new Error('メールの送信に失敗しました')
      }

      setOpen(false)
      setEmail("")
    } catch (error) {
      console.error('メール送信エラー:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        メール送信
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>請求書をメールで送信</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">送信先メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@example.com"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={sending}
              >
                {sending ? '送信中...' : '送信'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
} 