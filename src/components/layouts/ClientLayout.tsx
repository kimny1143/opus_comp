'use client'

import { AuthProvider } from '@/providers/AuthProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { MainLayout } from '@/components/layouts/MainLayout'
import { Toaster } from '@/components/ui/toaster'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <QueryProvider>
        <MainLayout>{children}</MainLayout>
      </QueryProvider>
      <Toaster />
    </AuthProvider>
  )
} 