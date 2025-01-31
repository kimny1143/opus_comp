import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { VendorPortalDashboard } from '@/components/dashboard/VendorPortalDashboard'
import { serializeDecimal } from '@/lib/utils/serialize'

export default async function VendorPortalPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  // ユーザーに紐づく取引先情報を取得
  const vendor = await prisma.vendor.findFirst({
    where: {
      users: {
        some: {
          id: session.user.id
        }
      }
    },
    include: {
      tags: true,
      users: true
    }
  })

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">取引先情報が見つかりません</h1>
        <p className="text-gray-600">
          システム管理者に連絡して、取引先情報の登録を依頼してください。
        </p>
      </div>
    )
  }

  // 取引先に紐づく請求書を取得
  const invoices = await prisma.invoice.findMany({
    where: {
      vendorId: vendor.id
    },
    include: {
      vendor: true,
      items: true,
      tags: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="container mx-auto py-8">
      <VendorPortalDashboard
        invoices={serializeDecimal(invoices)}
        vendorId={vendor.id}
      />
    </div>
  )
}