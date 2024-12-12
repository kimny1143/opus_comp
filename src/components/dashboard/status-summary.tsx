'use client'

import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, Clock, CheckCircle, AlertCircle, HourglassIcon } from 'lucide-react'

interface Stats {
  draft: number     // 下書き
  pending: number   // 保留中
  inProgress: number // 処理中
  completed: number // 完了
  issues: number    // 要対応
}

export function StatusSummary() {
  const { data: stats, isLoading, refetch } = useQuery<Stats>({
    queryKey: ['orderStats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats')
      if (!res.ok) throw new Error('統計情報の取得に失敗しました')
      return res.json() as Promise<Stats>
    },
    refetchOnWindowFocus: true,
    staleTime: 30000
  })

  if (isLoading) return <div>読み込み中...</div>

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">下書き</p>
          <p className="text-2xl font-bold">{stats?.draft || 0}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <HourglassIcon className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">保留中</p>
          <p className="text-2xl font-bold">{stats?.pending || 0}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">処理中</p>
          <p className="text-2xl font-bold">{stats?.inProgress || 0}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">完了</p>
          <p className="text-2xl font-bold">{stats?.completed || 0}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">要対応</p>
          <p className="text-2xl font-bold">{stats?.issues || 0}</p>
        </div>
      </div>
    </div>
  )
} 