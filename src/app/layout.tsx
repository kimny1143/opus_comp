import type { Metadata } from 'next'
import { ClientLayout } from '@/components/layouts/ClientLayout'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { SettingsProvider } from '@/contexts/settings-context'
import React from 'react'

export const metadata: Metadata = {
  title: 'OPUS - 業務管理システム',
  description: '業務管理システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="font-sans">
        <SettingsProvider>
          <ClientLayout>{children}</ClientLayout>
          <Toaster />
        </SettingsProvider>
      </body>
    </html>
  )
}
