import type { Metadata, Viewport } from 'next'
import { ClientLayout } from '@/components/layouts/ClientLayout'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { SettingsProvider } from '@/contexts/settings-context'
import { NextAuthProvider } from '../components/auth/NextAuthProvider'
import React from 'react'

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard', role: ['ADMIN', 'USER'] },
  { name: '取引先ポータル', href: '/vendor-portal', role: ['FREELANCER'] },
  { name: '取引先', href: '/vendors', role: ['ADMIN', 'USER'] },
  { name: '発注書', href: '/purchase-orders', role: ['ADMIN', 'USER'] },
  { name: '請求書', href: '/invoices', role: ['ADMIN', 'USER', 'FREELANCER'] }
]

export const metadata: Metadata = {
  title: {
    template: '%s | OPUS',
    default: 'OPUS - 業務管理システム',
  },
  description: '業務委託先情報管理、受発注管理、請求書管理を一元的に行うWebアプリケーション',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  applicationName: 'OPUS',
  keywords: ['業務管理', '受発注管理', '請求書管理'],
  authors: [{ name: 'OPUS Team' }],
  creator: 'OPUS Team',
  publisher: 'OPUS',
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="font-sans">
        <NextAuthProvider>
          <SettingsProvider>
            <ClientLayout>{children}</ClientLayout>
            <Toaster />
          </SettingsProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
