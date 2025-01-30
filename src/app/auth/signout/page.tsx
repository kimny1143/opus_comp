import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import SignOutForm from '@/components/auth/signout-form'

export default async function SignOutPage() {
  const session = await getServerSession(authOptions)
  const headersList = headers()
  
  // ログインしていない場合はサインインページにリダイレクト
  if (!session) {
    redirect('/auth/signin')
  }

  return <SignOutForm />
} 