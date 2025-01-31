'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PurchaseOrderStatus } from '@prisma/client'
import { Mail, Bell } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  createdAt: Date
  isRead: boolean
  recipientId: string
  recipient: {
    name: string | null
    email: string | null
  }
}

interface StatusNotificationProps {
  notifications: Notification[]
  onSendNotification: (recipients: string[], message: string) => Promise<void>
  onMarkAsRead: (notificationId: string) => Promise<void>
  recipients: Array<{
    id: string
    name: string
    email: string
    role: string
  }>
  currentStatus: PurchaseOrderStatus
  isUpdating?: boolean
}

const STATUS_NOTIFICATION_TEMPLATES: Record<PurchaseOrderStatus, string> = {
  DRAFT: '',
  PENDING: '承認待ちの発注書があります。確認をお願いします。',
  SENT: '発注書が送信されました。',
  COMPLETED: '発注書が完了しました。',
  REJECTED: '発注書が却下されました。',
  OVERDUE: '発注書が期限を超過しています。'
}

export function StatusNotification({
  notifications,
  onSendNotification,
  onMarkAsRead,
  recipients,
  currentStatus,
  isUpdating = false
}: StatusNotificationProps) {
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [customMessage, setCustomMessage] = useState(STATUS_NOTIFICATION_TEMPLATES[currentStatus])

  const handleSendNotification = async () => {
    if (selectedRecipients.length === 0) return
    try {
      await onSendNotification(selectedRecipients, customMessage)
      setSelectedRecipients([])
      setCustomMessage(STATUS_NOTIFICATION_TEMPLATES[currentStatus])
    } catch (error) {
      console.error('通知送信エラー:', error)
    }
  }

  const handleRecipientToggle = (recipientId: string) => {
    setSelectedRecipients(prev =>
      prev.includes(recipientId)
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">通知管理</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 通知送信フォーム */}
          <div className="space-y-3 border-b pb-4">
            <h3 className="font-medium">新規通知</h3>
            
            {/* 受信者選択 */}
            <div className="space-y-2">
              <Label>通知先</Label>
              {recipients.map(recipient => (
                <div key={recipient.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={recipient.id}
                    checked={selectedRecipients.includes(recipient.id)}
                    onCheckedChange={() => handleRecipientToggle(recipient.id)}
                  />
                  <Label htmlFor={recipient.id} className="text-sm">
                    {recipient.name} ({recipient.role})
                  </Label>
                </div>
              ))}
            </div>

            {/* メッセージ入力 */}
            <div className="space-y-2">
              <Label>メッセージ</Label>
              <Input
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="通知メッセージを入力"
              />
            </div>

            <Button
              onClick={handleSendNotification}
              disabled={selectedRecipients.length === 0 || !customMessage || isUpdating}
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              通知を送信
            </Button>
          </div>

          {/* 通知履歴 */}
          <div className="space-y-3">
            <h3 className="font-medium">通知履歴</h3>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">通知履歴はありません</p>
            ) : (
              <div className="space-y-3">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`flex items-start space-x-3 p-3 rounded-md ${
                      notification.isRead ? 'bg-muted/50' : 'bg-muted'
                    }`}
                  >
                    <Bell className="w-4 h-4 mt-1 flex-shrink-0" />
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(notification.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          送信先: {notification.recipient.name || notification.recipient.email}
                        </p>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkAsRead(notification.id)}
                            className="text-xs"
                          >
                            既読にする
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}