import type { Metadata } from 'next'
import { ClientLayout } from '@/components/layouts/ClientLayout'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { SettingsProvider } from '@/contexts/settings-context'
import React from 'react'

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard', role: ['ADMIN', 'USER'] },
  { name: '取引先ポータル', href: '/vendor-portal', role: ['FREELANCER'] },
  { name: '取引先', href: '/vendors', role: ['ADMIN', 'USER'] },
  { name: '発注書', href: '/purchase-orders', role: ['ADMIN', 'USER'] },
  { name: '請求書', href: '/invoices', role: ['ADMIN', 'USER', 'FREELANCER'] }
]

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
