import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClientLayout } from '@/components/layouts/ClientLayout'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { SettingsProvider } from '@/contexts/settings-context'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <SettingsProvider>
          <ClientLayout>{children}</ClientLayout>
          <Toaster />
        </SettingsProvider>
      </body>
    </html>
  )
}
