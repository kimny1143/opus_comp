import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { redirect } from 'next/navigation'
import Script from 'next/script'

export default async function NewPurchaseOrderLayout({
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

  return (
    <>
      <Script id="vendors-data" strategy="beforeInteractive">
        {`window.__INITIAL_VENDORS__ = ${JSON.stringify(vendors).replace(
          /</g,
          '\\u003c'
        )}`}
      </Script>
      {children}
    </>
  )
} 