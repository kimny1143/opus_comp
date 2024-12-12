import { PurchaseOrderForm } from '@/components/purchase-orders/PurchaseOrderForm'
import { prisma } from '@/lib/prisma'

export default async function NewPurchaseOrderPage() {
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

  return (
    <div>
      {/* vendorsデータをhiddenフィールドとして埋め込む */}
      <div id="vendors-data" data-vendors={JSON.stringify(vendors)} hidden />
      <PurchaseOrderForm mode="create" />
    </div>
  )
} 