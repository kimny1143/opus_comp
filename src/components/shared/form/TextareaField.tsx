'use client'

import { Controller, FieldValues } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from './FormField'
import { TextareaFieldProps } from './FormField.types'

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  readOnly,
  rows = 3
}: TextareaFieldProps<T>) {
  return (
    <FormField
      name={name}
      label={label}
    >
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Textarea
            {...field}
            rows={rows}
            disabled={readOnly}
          />
        )}
      />
    </FormField>
  )
} 