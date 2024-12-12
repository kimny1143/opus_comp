'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ErrorPage() {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">エラーが発生しました</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-gray-600">
            申し訳ありませんが、エラーが発生しました。
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => router.back()}
              variant="default"
            >
              戻る
            </Button>
            <Link href="/">
              <Button variant="outline">
                トップページへ
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 