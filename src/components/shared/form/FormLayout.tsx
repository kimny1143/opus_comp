import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface FormLayoutProps {
  title?: string
  children: ReactNode
  error?: string | null
  isSubmitting?: boolean
  onSubmit: () => void
  submitLabel?: string
  onCancel?: () => void
  cancelLabel?: string
}

export function FormLayout({
  title,
  children,
  error,
  isSubmitting = false,
  onSubmit,
  submitLabel = '保存',
  onCancel,
  cancelLabel = 'キャンセル'
}: FormLayoutProps) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}
        {children}
      </CardContent>
      <CardFooter className="flex justify-end space-x-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} onClick={onSubmit}>
          {isSubmitting ? '保存中...' : submitLabel}
        </Button>
      </CardFooter>
    </Card>
  )
} 