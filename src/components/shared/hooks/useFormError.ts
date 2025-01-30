import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

export function useFormError() {
  const { toast } = useToast()
  const [formError, setFormError] = useState<string | null>(null)

  const handleError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : '予期せぬエラーが発生しました'
    setFormError(errorMessage)
    toast({
      title: 'エラー',
      description: errorMessage,
      variant: 'destructive',
    })
  }

  const clearError = () => {
    setFormError(null)
  }

  return {
    formError,
    handleError,
    clearError,
  }
} 