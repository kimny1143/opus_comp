'use client'

import { ReactNode } from 'react'
import { FieldValues, Path } from 'react-hook-form'
import {
  FormControl,
  FormField as FormFieldUI,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  children: ReactNode;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  children
}: FormFieldProps<T>) {
  return (
    <FormFieldUI
      name={name}
      render={() => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>{children}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
} 