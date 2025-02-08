import { ReactNode } from 'react'
import { UseFormReturn, FormProvider, FieldValues } from 'react-hook-form'
import { Button } from '@/components/ui/button'

interface BaseFormWrapperProps<T extends FieldValues> {
  form: UseFormReturn<T>
  onSubmit: (data: T) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
  children: ReactNode | ((form: UseFormReturn<T>) => ReactNode)
  'data-testid'?: string
}

export function BaseFormWrapper<T extends FieldValues>({
  form,
  onSubmit,
  isSubmitting = false,
  onCancel,
  children,
  'data-testid': dataTestId
}: BaseFormWrapperProps<T>) {
  return (
    <FormProvider {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-6"
        data-testid={dataTestId}
      >
        {typeof children === 'function' ? children(form) : children}
        
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : '保存'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}