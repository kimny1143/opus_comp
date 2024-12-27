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
    include: {
      tags: true,
      createdBy: {
        select: {
          id: true,
          name: true
        }
      },
      updatedBy: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  return <VendorList vendors={vendors} />
} 