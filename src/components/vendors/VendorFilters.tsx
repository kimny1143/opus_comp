'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VendorCategory, VendorStatus } from '@prisma/client'
import { TagInput } from '@/components/shared/forms/TagInput'
import { Tag, VENDOR_CATEGORY_LABELS, VENDOR_STATUS_LABELS } from './schemas'

export interface VendorFiltersData {
  search: string
  category: VendorCategory | 'ALL'
  status: VendorStatus | 'ALL'
  tags: string[]
}

interface VendorFiltersProps {
  filters: VendorFiltersData
  onFiltersChange: (filters: VendorFiltersData) => void
  availableTags: string[]
}

export function VendorFilters({ filters, onFiltersChange, availableTags }: VendorFiltersProps) {
  const handleFilterChange = <K extends keyof VendorFiltersData>(
    key: K,
    value: VendorFiltersData[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">キーワード検索</label>
          <Input
            placeholder="取引先名・コードで検索..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">区分</label>
          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterChange('category', value as VendorCategory | 'ALL')}
          >
            <SelectTrigger>
              <SelectValue placeholder="区分を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">すべて</SelectItem>
              {Object.entries(VENDOR_CATEGORY_LABELS).map(([category, label]) => (
                <SelectItem key={category} value={category}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">ステータス</label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange('status', value as VendorStatus | 'ALL')}
          >
            <SelectTrigger>
              <SelectValue placeholder="ステータスを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">すべて</SelectItem>
              {Object.entries(VENDOR_STATUS_LABELS).map(([status, label]) => (
                <SelectItem key={status} value={status}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">タグ</label>
          <TagInput
            value={filters.tags.map((tag) => ({
              id: tag,
              name: tag
            }))}
            onChange={(tags) => handleFilterChange('tags', tags.map((tag) => tag.name))}
            label="タグ"
          />
        </div>
      </div>
    </div>
  )
}