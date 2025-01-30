import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { VendorList } from '@/components/vendors/VendorList'
import { prisma } from '@/lib/prisma'

export default async function VendorsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const vendors = await prisma.vendor.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      status: true,
      code: true,
      phone: true,
      email: true,
      updatedAt: true,
      tags: {
        select: {
          name: true
        }
      },
      createdBy: {
        select: {
          name: true
        }
      },
      updatedBy: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  console.log('Vendors from DB:', JSON.stringify(vendors, null, 2))

  // タグをオブジェクトから文字列の配列に変換し、必要なフィールドのみを抽出
  const formattedVendors = vendors.map(vendor => ({
    id: vendor.id,
    name: vendor.name,
    category: vendor.category,
    code: vendor.code,
    status: vendor.status,
    email: vendor.email,
    phone: vendor.phone,
    updatedAt: vendor.updatedAt,
    tags: vendor.tags.map(tag => tag.name),
    createdBy: {
      name: vendor.createdBy?.name || null
    },
    updatedBy: {
      name: vendor.updatedBy?.name || null
    }
  }))

  console.log('Formatted vendors:', JSON.stringify(formattedVendors, null, 2))

  return <VendorList vendors={formattedVendors} />
} 