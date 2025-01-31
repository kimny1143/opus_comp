import { Suspense } from 'react'
import { VendorList } from '@/components/vendors/VendorList'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: '取引先一覧 - OPUS',
  description: '取引先の一覧を表示し、検索やフィルタリングができます。',
}

export default async function VendorsPage() {
  const rawVendors = await prisma.vendor.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      code: true,
      status: true,
      email: true,
      phone: true,
      updatedAt: true,
      tags: {
        select: {
          name: true,
        },
      },
      createdBy: {
        select: {
          name: true,
        },
      },
      updatedBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  // タグ名の配列に変換
  const vendors = rawVendors.map(vendor => ({
    ...vendor,
    tags: vendor.tags.map(tag => tag.name),
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">取引先一覧</h1>
      <Suspense fallback={<div className="h-[400px] animate-pulse bg-gray-200 rounded-md" />}>
        <VendorList vendors={vendors} />
      </Suspense>
    </div>
  )
}