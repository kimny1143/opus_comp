'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PurchaseOrderStatus } from '@prisma/client'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Clock, Send } from 'lucide-react'

interface StatusHistoryItem {
  id: string
  type: string
  status: string
  comment: string | null
  createdAt: Date
  user: {
    name: string | null
  } | null
}

interface StatusHistoryProps {
  currentStatus: PurchaseOrderStatus
  statusHistory: StatusHistoryItem[]
  onStatusChange: (newStatus: PurchaseOrderStatus, comment: string) => Promise<void>
  isUpdating?: boolean
  readOnly?: boolean
}

const STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  DRAFT: '下書き',
  PENDING: '承認待ち',
  SENT: '送信済み',
  COMPLETED: '完了',
  REJECTED: '却下',
  OVERDUE: '期限超過'
}

const ALLOWED_STATUS_TRANSITIONS: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
  DRAFT: [PurchaseOrderStatus.PENDING],
  PENDING: [PurchaseOrderStatus.SENT, PurchaseOrderStatus.REJECTED],
  SENT: [PurchaseOrderStatus.COMPLETED, PurchaseOrderStatus.OVERDUE],
  COMPLETED: [],
  REJECTED: [PurchaseOrderStatus.DRAFT],
  OVERDUE: [PurchaseOrderStatus.COMPLETED]
}

export function StatusHistory({
  currentStatus,
  statusHistory,
  onStatusChange,
  isUpdating = false,
  readOnly = false
}: StatusHistoryProps) {
  const [newStatus, setNewStatus] = useState<PurchaseOrderStatus | ''>('')
  const [comment, setComment] = useState('')

  const allowedStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus]

  const handleStatusChange = async () => {
    if (!newStatus) return

    try {
      await onStatusChange(newStatus, comment)
      setNewStatus('')
      setComment('')
    } catch (error) {
      console.error('ステータス更新エラー:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">ステータス履歴</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 現在のステータス */}
          <div className="flex items-center justify-between bg-muted p-3 rounded-md">
            <div>
              <p className="text-sm font-medium">現在のステータス</p>
              <p className="text-lg font-bold">{STATUS_LABELS[currentStatus]}</p>
            </div>
          </div>

          {/* ステータス変更フォーム */}
          {!readOnly && allowedStatuses.length > 0 && (
            <div className="space-y-3 border-t pt-3">
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as PurchaseOrderStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="新しいステータスを選択" />
                </SelectTrigger>
                <SelectContent>
                  {allowedStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Textarea
                placeholder="コメントを入力(任意)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="h-20"
              />

              <Button
                onClick={handleStatusChange}
                disabled={!newStatus || isUpdating}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                ステータスを更新
              </Button>
            </div>
          )}

          {/* 履歴一覧 */}
          <div className="space-y-3 border-t pt-3">
            {statusHistory.map((item) => (
              <div key={item.id} className="flex gap-3 text-sm">
                <Clock className="w-4 h-4 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">
                    {STATUS_LABELS[item.status as PurchaseOrderStatus]}
                    <span className="text-muted-foreground ml-2">
                      {format(new Date(item.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
                    </span>
                  </p>
                  {item.comment && (
                    <p className="text-muted-foreground mt-1">{item.comment}</p>
                  )}
                  <p className="text-muted-foreground text-xs mt-1">
                    更新者: {item.user?.name || '不明'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}