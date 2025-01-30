import { useState } from 'react'
import { Tag } from '@/types/tag'

interface UseTaggingOptions {
  entityType: 'vendor' | 'invoice' | 'purchaseOrder'
  entityId: string
  initialTags?: Tag[]
}

export function useTagging({ entityType, entityId, initialTags = [] }: UseTaggingOptions) {
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const attachTag = async (tag: Tag) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/tags/${tag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entityType, entityId }),
      })
      const data = await response.json()
      if (data.success) {
        setTags([...tags, tag])
      } else {
        throw new Error(data.error || 'タグの関連付けに失敗しました')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'タグの関連付けに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const detachTag = async (tag: Tag) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/tags/${tag.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entityType, entityId }),
      })
      const data = await response.json()
      if (data.success) {
        setTags(tags.filter(t => t.id !== tag.id))
      } else {
        throw new Error(data.error || 'タグの関連付け解除に失敗しました')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'タグの関連付け解除に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    tags,
    setTags,
    isLoading,
    error,
    attachTag,
    detachTag,
  }
} 