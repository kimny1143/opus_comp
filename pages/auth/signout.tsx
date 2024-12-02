import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function SignOut() {
  const router = useRouter()

  useEffect(() => {
    signOut({ redirect: false }).then(() => {
      router.push('/auth/signin')
    })
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>サインアウトしています...</p>
    </div>
  )
} 