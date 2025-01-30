'use client'

import { Button } from "@/components/ui/button"
import { Invoice } from "@/types/invoice"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast/use-toast"

interface InvoiceEmailButtonProps {
  invoice: Invoice
}

export function InvoiceEmailButton({ invoice }: InvoiceEmailButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailData, setEmailData] = useState({
    to: invoice.vendor.email || '',
    cc: '',
    subject: `請求書 ${invoice.invoiceNumber}`,
    body: `${invoice.vendor.name} 様\n\n平素は格別のお引き立てを賜り、誠にありがとうございます。\n\n下記の通り、請求書を送付させていただきます。\n\nご確認の程、よろしくお願い申し上げます。\n\n請求書番号: ${invoice.invoiceNumber}\n請求金額: ¥${Number(invoice.totalAmount).toLocaleString()}\n支払期限: ${new Date(invoice.dueDate).toLocaleDateString()}\n\n何かご不明な点がございましたら、お気軽にお問い合わせください。\n\n今後ともよろしくお願い申し上げます。`
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/invoices/${invoice.id}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      })

      if (!response.ok) {
        throw new Error('メールの送信に失敗しました')
      }

      toast({
        title: "メールを送信しました",
        description: "請求書のメールが正常に送信されました。",
      })
      setOpen(false)
    } catch (error) {
      toast({
        title: "エラー",
        description: "メールの送信に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>請求書メール送信</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">宛先</Label>
              <Input
                id="to"
                value={emailData.to}
                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cc">CC</Label>
              <Input
                id="cc"
                value={emailData.cc}
                onChange={(e) => setEmailData({ ...emailData, cc: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">件名</Label>
              <Input
                id="subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">本文</Label>
              <Textarea
                id="body"
                value={emailData.body}
                onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                rows={10}
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
                disabled={loading}
              >
                {loading ? '送信中...' : '送信'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
} 