'use client'

import { Control } from 'react-hook-form'
import { FormField } from './FormField'
import { TagManager } from '@/components/common/TagManager'
import { TagFormData } from '@/types/tag'

interface TagFieldProps {
  name: string
  label: string
  control: Control<any>
  entityType: 'vendor' | 'invoice' | 'purchaseOrder'
  entityId: string
  placeholder?: string
  readOnly?: boolean
}

export function TagField({
  name,
  label,
  control,
  entityType,
  entityId,
  placeholder = 'タグを追加...',
  readOnly = false
}: TagFieldProps) {
  return (
    <FormField
      name={name}
      label={label}
      control={control}
    >
      {(field) => (
        <TagManager
          entityType={entityType}
          entityId={entityId}
          selectedTags={field.value || []}
          onTagsChange={(tags: TagFormData[]) => field.onChange(tags)}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      )}
    </FormField>
  )
} 