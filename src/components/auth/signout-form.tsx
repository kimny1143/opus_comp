'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignOutForm() {
  const router = useRouter()

  useEffect(() => {
    signOut({ redirect: false }).then(() => {
      router.push('/auth/signin')
    })
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <p className="text-gray-600">サインアウトしています...</p>
    </div>
  )
} 