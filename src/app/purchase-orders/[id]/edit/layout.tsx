import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function EditPurchaseOrderLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const vendors = await prisma.vendor.findMany({
    select: {
      id: true,
      name: true,
      code: true
    },
    orderBy: {
      code: 'asc'
    }
  })

  const headersList = headers()
  
  return (
    <div>
      {children}
      <div id="vendors-data" data-vendors={JSON.stringify(vendors)} />
    </div>
  )
} 