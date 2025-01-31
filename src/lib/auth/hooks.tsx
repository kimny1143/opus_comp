import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AuthUser } from './types'

export function useAuth(requireAuth: boolean = true) {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const loading = status === 'loading'
  const authenticated = status === 'authenticated'
  
  if (!loading && !authenticated && requireAuth) {
    router.push('/auth/signin')
  }

  const user = session?.user as AuthUser | undefined
  
  return { 
    session, 
    loading, 
    authenticated,
    user
  }
}