import { Metadata } from 'next'
import { TagSettings } from '@/components/settings/TagSettings'

export const metadata: Metadata = {
  title: 'タグ設定 | OPUS',
  description: 'タグの管理を行います',
}

export default function TagSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">タグ設定</h1>
      <TagSettings />
    </div>
  )
} 