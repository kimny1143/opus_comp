import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-primary">403 - アクセス権限がありません</h1>
        
        <p className="text-lg text-muted-foreground">
          このページにアクセスする権限がありません。
        </p>
        
        <div className="space-x-4">
          <Button asChild>
            <Link href="/dashboard">
              ダッシュボードへ戻る
            </Link>
          </Button>
          
          <Button asChild>
            <Link href="/login">
              ログインし直す
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}