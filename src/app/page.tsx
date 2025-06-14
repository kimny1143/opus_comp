import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/auth/[...nextauth]/auth-options'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  redirect('/dashboard')
}