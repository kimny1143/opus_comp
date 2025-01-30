import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import SignInForm from '@/components/auth/signin-form'

export default async function SignInPage() {
  const session = await getServerSession(authOptions)
  const headersList = headers()
  
  // すでにログインしている場合はダッシュボードにリダイレクト
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <SignInForm />
    </div>
  )
} 