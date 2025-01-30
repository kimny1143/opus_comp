'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import type { TagFormData } from '@/types/tag'
import clsx from 'clsx'

interface TagProps {
  tag: TagFormData
  onDelete?: (tag: TagFormData) => void
  size?: 'sm' | 'md'
  className?: string
}

export const Tag = ({ tag, onDelete, className, size = 'md' }: TagProps) => {
  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800',
        size === 'sm' && 'text-xs px-2 py-0.5',
        className
      )}
    >
      <span>{tag.name}</span>
      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(tag)}
          className="rounded-full p-0.5 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          data-testid="delete-tag-button"
        >
          <XMarkIcon className={clsx('text-gray-500', size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
        </button>
      )}
    </div>
  )
} 