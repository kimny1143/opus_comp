'use client'

import { ReactNode } from 'react'
import { Control, ControllerRenderProps, FieldValues, Path } from 'react-hook-form'
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
  control: Control<T>;
  required?: boolean;
  description?: string;
  children: ReactNode | ((field: ControllerRenderProps<T, Path<T>>) => ReactNode);
}

export function FormField<T extends FieldValues>({
  name,
  label,
  control,
  required,
  description,
  children
}: FormFieldProps<T>) {
  return (
    <FormFieldUI
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>{typeof children === 'function' ? children(field) : children}</FormControl>
          {description && <p className="text-sm text-gray-500">{description}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
} 