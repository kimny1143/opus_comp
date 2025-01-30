'use client'

import { Control, FieldValues, Path, useController } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export type SelectOption = {
  value: string
  label: string
}

export interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>
  label: string
  control: Control<T>
  options: readonly SelectOption[]
  required?: boolean
  disabled?: boolean
  className?: string
}

export function SelectField<T extends FieldValues>({
  name,
  label,
  control,
  options,
  required = false,
  disabled = false,
  className = ''
}: SelectFieldProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: { required: required && `${label}は必須です` }
  })

  return (
    <div className={className}>
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  )
} 