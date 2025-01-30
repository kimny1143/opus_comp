'use client'

import { Control, FieldValues, Path } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { FormField } from './FormField'

interface InputFieldProps<T extends FieldValues> extends React.InputHTMLAttributes<HTMLInputElement> {
  name: Path<T>
  label?: string
  control: Control<T>
  required?: boolean
  description?: string
}

export function InputField<T extends FieldValues>({
  name,
  label,
  control,
  required,
  description,
  type = 'text',
  ...props
}: InputFieldProps<T>) {
  return (
    <FormField
      name={name}
      label={label}
      control={control}
      required={required}
      description={description}
    >
      {(field) => (
        <Input
          {...field}
          type={type}
          {...props}
        />
      )}
    </FormField>
  )
} 