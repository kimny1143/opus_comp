'use client'

import { QueryProvider } from '@/providers/QueryProvider'
import { MainLayout } from '@/components/layouts/MainLayout'
import { Toaster } from '@/components/ui/toaster'
import React from 'react'

type ClientLayoutProps = {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <QueryProvider>
      <MainLayout>{children}</MainLayout>
      <Toaster />
    </QueryProvider>
  )
}