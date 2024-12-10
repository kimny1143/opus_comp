import { getProviders } from 'next-auth/react'
import { SignInForm } from '@/components/auth/SignInForm'

export default async function SignInPage() {
  const providers = await getProviders()

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            サインイン
          </h2>
        </div>
        <SignInForm providers={providers} />
      </div>
    </div>
  )
} 