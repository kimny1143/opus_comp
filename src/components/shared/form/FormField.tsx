'use client'

import { ReactNode } from 'react'
import { Control, FieldValues, Path, useController, ControllerRenderProps } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>
  label?: string
  control: Control<T>
  children: ReactNode | ((field: ControllerRenderProps<T, Path<T>>) => ReactNode)
  className?: string
  required?: boolean
  description?: string
}

export function FormField<T extends FieldValues>({
  name,
  label,
  control,
  children,
  className,
  required,
  description
}: FormFieldProps<T>) {
  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control
  })

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name} className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      {typeof children === 'function' ? children(field) : children}
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      {error?.message && (
        <p className="text-sm text-red-500" data-cy={`${name}-error`}>{error.message}</p>
      )}
    </div>
  )
} 