'use client'

import { Control, FieldValues, Path, useController } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

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
    const parsedValue = isNaN(Number(newValue)) ? newValue : Number(newValue)
    fieldOnChange(parsedValue)
    onChange?.(parsedValue)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={value ? String(value) : undefined}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger id={name} className="w-full">
          <SelectValue placeholder="選択してください" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={4}
          align="start"
          className="w-full min-w-[200px]"
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={String(option.value)}
              className="cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error.message}</p>
      )}
    </div>
  )
}