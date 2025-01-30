import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import { CreateBusinessTypeTags } from '@/components/admin/CreateBusinessTypeTags'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'ADMIN'
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ダッシュボード</h1>
      {isAdmin && (
        <div className="mb-4">
          <CreateBusinessTypeTags />
        </div>
      )}
      <DashboardContent />
    </div>
  )
} 