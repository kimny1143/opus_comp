import { useState, useEffect } from 'react'
import { Tag, TagFormData } from '@/types/tag'

interface UseTagsOptions {
  initialTags?: TagFormData[]
  entityType: string
  entityId?: string
}

export function useTags({ initialTags = [], entityType, entityId }: UseTagsOptions) {
  const [tags, setTags] = useState<TagFormData[]>(initialTags)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/tags?entityType=${entityType}${entityId ? `&entityId=${entityId}` : ''}`)
        const data = await response.json()
        if (data.success) {
          setTags(data.tags.map((tag: Tag) => ({
            id: tag.id,
            name: tag.name
          })))
        } else {
          setError(data.error || 'タグの取得に失敗しました')
        }
      } catch (err) {
        setError('タグの取得中にエラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTags()
  }, [entityType, entityId])

  const addTag = async (tagName: string): Promise<TagFormData | null> => {
    const trimmedName = tagName.trim()
    if (!trimmedName) return null

    try {
      // 既存のタグをチェック
      const existingTag = tags.find(tag => tag.name === trimmedName)
      if (existingTag) return existingTag

      // 新しいタグを作成
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: trimmedName,
          entityType,
          entityId
        }),
      })
      const data = await response.json()
      if (data.success) {
        const newTag = {
          id: data.tag.id,
          name: data.tag.name
        }
        setTags([...tags, newTag])
        return newTag
      } else {
        throw new Error(data.error || 'タグの作成に失敗しました')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'タグの追加に失敗しました')
      return null
    }
  }

  const removeTag = async (tagId: string) => {
    try {
      const response = await fetch('/api/tags', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: tagId,
          entityType,
          entityId
        }),
      })
      const data = await response.json()
      if (data.success) {
        setTags(tags.filter(tag => tag.id !== tagId))
      } else {
        throw new Error(data.error || 'タグの削除に失敗しました')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'タグの削除に失敗しました')
    }
  }

  const updateTags = (newTags: TagFormData[]) => {
    setTags(newTags)
  }

  return {
    tags,
    setTags,
    isLoading,
    error,
    addTag,
    removeTag,
    updateTags,
  }
} 