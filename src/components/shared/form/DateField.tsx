'use client'

import { Control, FieldValues, Path, useController } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'

export interface DateFieldProps<T extends FieldValues> {
  name: Path<T>
  label: string
  control: Control<T>
  required?: boolean
  disabled?: boolean
  className?: string
  min?: string | number
  max?: string | number
}

export function DateField<T extends FieldValues>({
  name,
  label,
  control,
  required = false,
  disabled = false,
  className = '',
  min,
  max
}: DateFieldProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: { required: required && `${label}は必須です` }
  })

  const formatDate = (value: any): string => {
    if (!value) return ''
    if (value instanceof Date) return format(value, 'yyyy-MM-dd')
    try {
      return format(new Date(value), 'yyyy-MM-dd')
    } catch {
      return ''
    }
  }

  return (
    <div className={className}>
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        type="date"
        value={formatDate(value)}
        onChange={(e) => {
          const date = e.target.value ? new Date(e.target.value) : null
          onChange(date)
        }}
        disabled={disabled}
        min={min}
        max={max}
      />
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  )
} 