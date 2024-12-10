'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

interface Provider {
  id: string
  name: string
}

interface SignInFormProps {
  providers: Record<string, Provider> | null
}

export function SignInForm({ providers }: SignInFormProps) {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/'

  if (!providers) {
    return null
  }

  return (
    <div className="mt-8 space-y-6">
      {Object.values(providers).map((provider) => (
        <div key={provider.id}>
          <button
            onClick={() => signIn(provider.id, { callbackUrl })}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {provider.name}でサインイン
          </button>
        </div>
      ))}
    </div>
  )
} 