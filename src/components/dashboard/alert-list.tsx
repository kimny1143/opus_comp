'use client'

import { useQuery } from '@tanstack/react-query'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Alert {
  id: string
  type: 'info' | 'warning' | 'error'
  message: string
}

export function AlertList() {
  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/alerts')
      if (!res.ok) throw new Error('アラートの取得に失敗しました')
      return res.json()
    }
  })

  if (!alerts) return <div>読み込み中...</div>

  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-4">
      {alerts?.map(alert => (
        <div key={alert.id} className="flex items-start gap-2">
          {getIcon(alert.type)}
          <p className="text-sm">{alert.message}</p>
        </div>
      ))}
    </div>
  )
} 