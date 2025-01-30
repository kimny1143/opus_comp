import { useState, useEffect } from 'react'
import { Tag } from '@prisma/client'

interface UseTagsOptions {
  type?: string
  initialTags?: Tag[]
}

export function useTags({ type, initialTags = [] }: UseTagsOptions = {}) {
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (initialTags.length > 0) {
      setTags(initialTags)
    }
  }, [initialTags])

  const fetchTags = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/tags${type ? `?type=${type}` : ''}`)
      if (!response.ok) {
        throw new Error('タグの取得に失敗しました')
      }
      const data = await response.json()
      return data.tags
    } catch (error) {
      setError(error instanceof Error ? error : new Error('予期せぬエラーが発生しました'))
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const createTag = async (name: string) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, type }),
      })
      if (!response.ok) {
        throw new Error('タグの作成に失敗しました')
      }
      const data = await response.json()
      return data.tag
    } catch (error) {
      setError(error instanceof Error ? error : new Error('予期せぬエラーが発生しました'))
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = async (tagToAdd: Tag | string) => {
    let newTag: Tag | null = null
    
    if (typeof tagToAdd === 'string') {
      newTag = await createTag(tagToAdd)
      if (!newTag) return
    } else {
      newTag = tagToAdd
    }

    if (!tags.some(tag => tag.id === newTag!.id)) {
      setTags(prev => [...prev, newTag!])
    }
  }

  const removeTag = (tagId: string) => {
    setTags(prev => prev.filter(tag => tag.id !== tagId))
  }

  const updateTags = (newTags: Tag[]) => {
    setTags(newTags)
  }

  return {
    tags,
    isLoading,
    error,
    addTag,
    removeTag,
    updateTags,
  }
} 