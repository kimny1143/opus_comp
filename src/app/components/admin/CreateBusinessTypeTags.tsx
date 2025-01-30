import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast/use-toast'

export function CreateBusinessTypeTags() {
  const { toast } = useToast()

  const handleClick = async () => {
    try {
      const response = await fetch('/api/tags/seed-business-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '業種タグの作成に失敗しました')
      }

      toast({
        title: '成功',
        description: data.message,
      })
    } catch (error) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : '業種タグの作成に失敗しました',
        variant: 'destructive',
      })
    }
  }

  return (
    <Button onClick={handleClick}>
      業種タグを作成
    </Button>
  )
} 