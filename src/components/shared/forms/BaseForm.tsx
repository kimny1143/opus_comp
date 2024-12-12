'use client'

import { ReactNode } from 'react'
import {
  useForm,
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
  DefaultValues
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

interface BaseFormProps<T extends z.ZodType<any, any>> {
  schema: T
  defaultValues?: DefaultValues<z.infer<T>>
  onSubmit: (data: z.infer<T>) => Promise<void>
  onCancel?: () => void
  children: (methods: {
    register: UseFormRegister<z.infer<T>>
    watch: UseFormWatch<z.infer<T>>
    setValue: UseFormSetValue<z.infer<T>>
    errors: FieldErrors<z.infer<T>>
    isSubmitting: boolean
  }) => ReactNode
}

export function BaseForm<T extends z.ZodType<any, any>>({
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  children
}: BaseFormProps<T>) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {children({ register, watch, setValue, errors, isSubmitting })}

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  )
} 