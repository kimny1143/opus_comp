import { PurchaseOrderForm } from '@/components/purchase-orders/PurchaseOrderForm'
import { prisma } from '@/lib/prisma'
import { unstable_noStore as noStore } from 'next/cache'

export default async function NewPurchaseOrderPage() {
  noStore()
  
  // 取引先データを取得
  const vendors = await prisma.vendor.findMany({
    where: {
      status: 'ACTIVE'
    },
    select: {
      id: true,
      name: true,
      code: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  // クライアントコンポーネントに安全にデータを渡すため、
  // シリアライズ可能な形式に変換
  const serializedVendors = vendors.map(vendor => ({
    ...vendor,
    id: vendor.id.toString(),
  }))

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">発注書作成</h1>
      <PurchaseOrderForm 
        mode="create" 
        initialVendors={serializedVendors}
      />
    </div>
  )
} 