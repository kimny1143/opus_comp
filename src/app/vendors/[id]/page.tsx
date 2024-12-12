import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import VendorDetail from '@/components/vendors/VendorDetail'

export default async function VendorDetailPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <VendorDetail />
    </div>
  )
}
// Compare this snippet from src/app/vendors/%5Bid%5D/edit/page.tsx: