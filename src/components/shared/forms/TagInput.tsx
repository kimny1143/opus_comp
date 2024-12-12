'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { UseFormRegister } from 'react-hook-form'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Tag, VendorFormData } from '@/components/vendors/schemas'
import isEqual from 'lodash/isEqual'

interface TagInputProps {
  value?: Tag[]
  onChange?: (value: Tag[]) => void
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void
  name?: string
  label?: string
  error?: { message?: string }
  register?: UseFormRegister<VendorFormData>
}

export function TagInput({ 
  value = [], 
  onChange, 
  onBlur,
  name,
  label, 
  error,
  register 
}: TagInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = React.useState('')
  const [tags, setTags] = React.useState<Tag[]>(value)

  React.useEffect(() => {
    setTags(value)
  }, [value])

  React.useEffect(() => {
    if (onChange && !isEqual(tags, value)) {
      onChange(tags)
    }
  }, [tags, onChange, value])

  const handleAddTag = (tagName: string) => {
    const trimmedName = tagName.trim()
    if (!trimmedName) return

    // 重複チェック
    if (!tags.some(tag => tag.name === trimmedName)) {
      const newTag: Tag = {
        name: trimmedName
      }
      setTags([...tags, newTag])
    }
    setInputValue('')
  }

  const handleRemoveTag = (tagToRemove: Tag) => {
    setTags(tags.filter(tag => tag.name !== tagToRemove.name))
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <Command className="border rounded-md">
        <div className="flex flex-wrap gap-1 p-2">
          {tags.map(tag => (
            <Badge
              key={tag.name}
              variant="secondary"
              className="max-w-[200px] truncate"
            >
              {tag.name}
              <button
                type="button"
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRemoveTag(tag)
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={() => handleRemoveTag(tag)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          <CommandInput
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue) {
                e.preventDefault()
                handleAddTag(inputValue)
              }
            }}
            placeholder="タグを入力..."
            className="flex-1 min-w-[120px] outline-none border-none focus:ring-0"
          />
        </div>
        <CommandList>
          <CommandEmpty>タグが見つかりません</CommandEmpty>
          <CommandGroup>
            {inputValue && (
              <CommandItem
                value={inputValue}
                onSelect={() => handleAddTag(inputValue)}
              >
                「{inputValue}」を追加
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </Command>
      {error?.message && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
    </div>
  )
} 