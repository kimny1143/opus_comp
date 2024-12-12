import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/providers/AuthProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { MainLayout } from '@/components/layouts/MainLayout'
import './globals.css'

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
        <AuthProvider>
          <QueryProvider>
            <MainLayout>{children}</MainLayout>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
