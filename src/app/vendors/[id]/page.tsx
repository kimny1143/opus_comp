import { notFound } from 'next/navigation'
import { VendorManagement } from '@/components/vendors/VendorManagement'
import { prisma } from '@/lib/prisma'
import { ExtendedVendor } from '@/types/vendor'
import { TagFormData } from '@/types/tag'

interface Props {
  params: {
    id: string
  }
}

export default async function VendorPage({ params }: Props) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: params.id },
    include: {
      tags: true
    }
  })

  if (!vendor) {
    notFound()
  }

  const extendedVendor: Partial<ExtendedVendor> = {
    ...vendor,
    bankInfo: null,
    tags: vendor.tags.map(tag => ({
      id: tag.id,
      name: tag.name
    } satisfies TagFormData))
  }

  return <VendorManagement initialData={extendedVendor} />
}
