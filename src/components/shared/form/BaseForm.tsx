'use client'

import { ReactNode } from 'react'
import { useForm, UseFormProps, FieldValues, DefaultValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useFormError } from '../hooks/useFormError'
import { FormLayout } from './FormLayout'

interface BaseFormProps<T extends FieldValues> {
  title: string
  schema: z.ZodType<T>
  defaultValues: DefaultValues<T>
  onSubmit: (data: T) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
  children: ReactNode | ((form: ReturnType<typeof useForm<T>>) => ReactNode)
}

export function BaseForm<T extends FieldValues>({
  title,
  schema,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  onCancel,
  children
}: BaseFormProps<T>) {
  const { formError, handleError, clearError } = useFormError()
  
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues
  })

  const handleSubmit = async (data: T) => {
    try {
      clearError()
      await onSubmit(data)
    } catch (error) {
      handleError(error)
    }
  }

  return (
    <FormLayout
      title={title}
      error={formError}
      isSubmitting={isSubmitting}
      onSubmit={form.handleSubmit(handleSubmit)}
      onCancel={onCancel}
    >
      {typeof children === 'function' ? children(form) : children}
    </FormLayout>
  )
} 