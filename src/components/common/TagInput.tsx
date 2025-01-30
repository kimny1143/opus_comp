'use client'

import { useState } from 'react'
import { Tag } from '@/components/shared/form/schemas/commonSchema'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Tag as TagComponent } from './Tag'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import clsx from 'clsx'

interface TagInputProps {
  tags: Tag[]
  onAdd: (name: string) => void
  onDelete: (tag: Tag) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

export const TagInput = ({
  tags,
  onAdd,
  onDelete,
  className,
  placeholder = 'タグを入力',
  disabled = false
}: TagInputProps) => {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedInput = input.trim()
    if (trimmedInput) {
      onAdd(trimmedInput)
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className={clsx('space-y-2', className)}>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <TagComponent 
            key={tag.id} 
            tag={{ 
              id: tag.id || '', 
              name: tag.name 
            }} 
            onDelete={() => onDelete(tag)} 
            size="sm" 
          />
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="add-tag-button"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  )
} 