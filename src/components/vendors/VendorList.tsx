'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { VendorCategory } from '@prisma/client'
import { Building2, Phone, Mail, Calendar, LayoutGrid, LayoutList } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { VENDOR_CATEGORY_LABELS } from './schemas'
import { VendorWithRelations } from '@/types/vendor'

interface VendorListProps {
  vendors: VendorWithRelations[]
}

export function VendorList({ vendors: initialVendors = [] }: VendorListProps) {
  const [vendors, setVendors] = useState<VendorWithRelations[]>(initialVendors)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table')

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch('/api/vendors')
        if (!res.ok) throw new Error('取引先の取得に失敗しました')
        const data = await res.json()
        setVendors(data.vendors || [])
      } catch (err) {
        setError('取引先の取得に失敗しました')
        setVendors([])
      }
    }
    fetchVendors()
  }, [])

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!vendors) {
    return <div>読み込み中...</div>
  }

  function handleDelete(id: string) {
    if (confirm('本当に削除しますか？')) {
      fetch(`/api/vendors/${id}`, {
        method: 'DELETE',
      })
        .then((res) => {
          if (!res.ok) throw new Error('削除に失敗しました')
          setVendors((prevVendors: VendorWithRelations[]) => 
            prevVendors.filter((vendor: VendorWithRelations) => vendor.id !== id)
          )
        })
        .catch((err) => {
          console.error(err)
          alert('削除に失敗しました')
        })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">取引先一覧</h1>
          <div className="flex items-center gap-2 border rounded-lg p-1">
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Link href="/vendors/new">
          <Button>新規作成</Button>
        </Link>
      </div>

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((vendor) => (
            <Card key={vendor.id}>
              <CardContent className="p-4">
                <Link href={`/vendors/${vendor.id}`}>
                  <h3 className="text-lg font-semibold mb-2 hover:text-blue-600">
                    {vendor.name}
                    {vendor.category === 'INDIVIDUAL' && vendor.tradingName && (
                      <span className="text-sm text-gray-500 ml-2">
                        ({vendor.tradingName})
                      </span>
                    )}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 mb-2">
                  {vendor.contactPerson || '担当者未設定'}
                </p>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Phone className="w-4 h-4 mr-2" />
                  {vendor.phone || '未設定'}
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Mail className="w-4 h-4 mr-2" />
                  {vendor.email || '未設定'}
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Building2 className="w-4 h-4 mr-2" />
                  {VENDOR_CATEGORY_LABELS[vendor.category]}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  最終更新日: {new Date(vendor.updatedAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>区分</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>担当者</TableHead>
                <TableHead>連絡先</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>{VENDOR_CATEGORY_LABELS[vendor.category]}</TableCell>
                  <TableCell>
                    <Link
                      href={`/vendors/${vendor.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {vendor.name}
                      {vendor.category === 'INDIVIDUAL' && vendor.tradingName && (
                        <span className="text-gray-500 text-sm ml-2">
                          ({vendor.tradingName})
                        </span>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>{vendor.contactPerson || '未設定'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {vendor.phone || '未設定'}
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {vendor.email || '未設定'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          vendor.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : vendor.status === 'INACTIVE'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {vendor.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link
                        href={`/vendors/${vendor.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        詳細
                      </Link>
                      <button
                        onClick={() => handleDelete(vendor.id)}
                        className="text-red-600 hover:underline"
                      >
                        削除
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
} 