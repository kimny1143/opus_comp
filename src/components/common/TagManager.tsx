'use client'

import { useState, useEffect, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { X, Plus } from 'lucide-react'
import { TagFormData } from '@/types/tag'
import { useTags } from '@/hooks/useTags'

export interface TagManagerProps {
  selectedTags: TagFormData[]
  onTagsChange: (tags: TagFormData[]) => void
  entityType: string
  entityId?: string
  placeholder?: string
  readOnly?: boolean
}

export function TagManager({
  selectedTags = [],
  onTagsChange,
  entityType,
  entityId,
  placeholder = 'タグを追加...',
  readOnly = false
}: TagManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { tags, addTag, removeTag } = useTags({
    initialTags: selectedTags,
    entityType,
    entityId
  })

  // 受け取ったタグをTagFormDataとして扱う
  const convertedTags = useMemo(() => {
    try {
      return tags
    } catch (error) {
      setError(error instanceof Error ? error.message : 'タグの変換に失敗しました')
      return []
    }
  }, [tags])

  const handleSelect = (tag: TagFormData) => {
    if (!tag.name.trim()) {
      setError('タグ名は必須です')
      return
    }

    if (!convertedTags.some(t => t.id === tag.id)) {
      onTagsChange([...convertedTags, tag])
    }
    setSearch('')
  }

  const handleRemove = (tagId: string) => {
    onTagsChange(convertedTags.filter(tag => tag.id !== tagId))
  }

  const handleCreateTag = async () => {
    const trimmedName = search.trim()
    if (!trimmedName) {
      setError('タグ名は必須です')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const newTag = await addTag(trimmedName)
      if (newTag) {
        onTagsChange([...convertedTags, newTag])
        setSearch('')
      }
    } catch (err) {
      setError('新規タグの作成中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>
  }

  const filteredTags = convertedTags.filter(tag => 
    !convertedTags.some(t => t.id === tag.id) &&
    tag.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {convertedTags.map(tag => (
          <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
            {tag.name}
            {!readOnly && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => handleRemove(tag.id)}
                aria-label="削除"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </Badge>
        ))}
      </div>
      {!readOnly && (
        <Command className="border rounded-md">
          <CommandInput 
            placeholder={placeholder} 
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>
            {search.trim() && (
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={handleCreateTag}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                「{search.trim()}」を新規作成
              </Button>
            )}
          </CommandEmpty>
          <CommandGroup>
            {filteredTags.map(tag => (
              <CommandItem key={tag.id} onSelect={() => handleSelect(tag)}>
                {tag.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      )}
    </div>
  )
} 