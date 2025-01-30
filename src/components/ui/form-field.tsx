import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface FormFieldProps {
  label?: string
  error?: string
  children: ReactNode
  className?: string
}

export function FormField({ label, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
} 