'use client'

import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormErrorProps {
  message?: string | null
  className?: string
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm text-destructive mt-1',
        className
      )}
      role="alert"
    >
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )
}

interface FormFieldErrorProps {
  id: string
  errors: Array<{
    path: (string | number)[]
    message: string
  }> | null
  path: (string | number)[]
  className?: string
}

export function FormFieldError({ id, errors, path, className }: FormFieldErrorProps) {
  if (!errors) return null

  const error = errors.find(err => 
    err.path.length === path.length && 
    err.path.every((value, index) => value === path[index])
  )

  if (!error) return null

  return (
    <div
      id={`${id}-error`}
      className={cn(
        'flex items-center gap-2 text-sm text-destructive mt-1',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-4 w-4" />
      <span>{error.message}</span>
    </div>
  )
}

interface FormFieldProps {
  id: string
  label: string
  error?: string | null
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({
  id,
  label,
  error,
  required,
  children,
  className
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      <FormError message={error} />
    </div>
  )
}

interface FormSectionProps {
  title: string
  description?: string
  error?: string | null
  children: React.ReactNode
  className?: string
}

export function FormSection({
  title,
  description,
  error,
  children,
  className
}: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-1">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <FormError message={error} />
      </div>
      {children}
    </div>
  )
}