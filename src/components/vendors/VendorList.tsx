'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { Vendor, VendorCategory, VendorStatus } from '@prisma/client'
import { Building2, Phone, Mail, Calendar, LayoutGrid, List } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VENDOR_CATEGORY_LABELS } from './schemas'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { VendorFilters, VendorFiltersData } from './VendorFilters'

interface VendorListProps {
  vendors: {
    id: string
    name: string
    category: VendorCategory
    code: string
    status: VendorStatus
    email: string
    phone: string
    updatedAt: Date
    tags: string[]
    createdBy: {
      name: string | null
    }
    updatedBy: {
      name: string | null
    }
  }[]
}

type ViewMode = 'list' | 'grid'

export function VendorList({ vendors }: VendorListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [filters, setFilters] = useState<VendorFiltersData>({
    search: '',
    category: 'ALL',
    status: 'ALL',
    tags: []
  })

  // 利用可能なタグの一覧を取得
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    vendors.forEach(vendor => {
      vendor.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet)
  }, [vendors])

  // フィルタリングされた取引先一覧
  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      // キーワード検索
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesName = vendor.name.toLowerCase().includes(searchLower)
        const matchesCode = vendor.code.toLowerCase().includes(searchLower)
        if (!matchesName && !matchesCode) return false
      }

      // 区分フィルター
      if (filters.category !== 'ALL' && vendor.category !== filters.category) {
        return false
      }

      // ステータスフィルター
      if (filters.status !== 'ALL' && vendor.status !== filters.status) {
        return false
      }

      // タグフィルター
      if (filters.tags.length > 0) {
        const hasAllTags = filters.tags.every(tag => vendor.tags.includes(tag))
        if (!hasAllTags) return false
      }

      return true
    })
  }, [vendors, filters])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Link href="/vendors/new">
          <Button className="flex items-center gap-2">
            <span className="hidden md:inline">新規取引先を登録</span>
            <span className="md:hidden">新規登録</span>
          </Button>
        </Link>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <VendorFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={availableTags}
      />

      {viewMode === 'list' ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>取引先名</TableHead>
                <TableHead>区分</TableHead>
                <TableHead>コード</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>タグ</TableHead>
                <TableHead>更新日時</TableHead>
                <TableHead>更新者</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>
                    <Link
                      href={`/vendors/${vendor.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {vendor.name}
                    </Link>
                  </TableCell>
                  <TableCell>{VENDOR_CATEGORY_LABELS[vendor.category]}</TableCell>
                  <TableCell>{vendor.code}</TableCell>
                  <TableCell>{vendor.status}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {vendor.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{vendor.updatedAt.toLocaleDateString()}</TableCell>
                  <TableCell>{vendor.updatedBy?.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVendors.map((vendor) => (
            <Card key={vendor.id} className="p-4">
              <div className="space-y-2">
                <div>
                  <Link
                    href={`/vendors/${vendor.id}`}
                    className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {vendor.name}
                  </Link>
                </div>
                <div className="text-sm text-gray-500">
                  <div>区分: {VENDOR_CATEGORY_LABELS[vendor.category]}</div>
                  <div>コード: {vendor.code}</div>
                  <div>ステータス: {vendor.status}</div>
                  {vendor.email && <div>メール: {vendor.email}</div>}
                  {vendor.phone && <div>電話番号: {vendor.phone}</div>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {vendor.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  <div>更新日時: {vendor.updatedAt.toLocaleDateString()}</div>
                  <div>更新者: {vendor.updatedBy?.name}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
