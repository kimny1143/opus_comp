'use client'

import { Control, FieldValues, Path, useController } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export type SelectOption = {
  value: string | number
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
  onChange?: (value: string | number) => void
}

export function SelectField<T extends FieldValues>({
  name,
  label,
  control,
  options,
  required = false,
  disabled = false,
  className = '',
  onChange
}: SelectFieldProps<T>) {
  const {
    field: { value, onChange: fieldOnChange },
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: { required: required && `${label}は必須です` }
  })

  const handleChange = (newValue: string) => {
    // 数値なら parseFloat, 文字列ならそのまま
    const parsedValue = isNaN(Number(newValue)) ? newValue : Number(newValue);
    fieldOnChange(parsedValue);
    onChange?.(parsedValue);
  }

  return (
    <div className={className}>
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={String(value)}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
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