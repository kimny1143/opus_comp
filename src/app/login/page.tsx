'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard'
      })

      if (result?.error) {
        setError('認証に失敗しました')
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      setError('エラーが発生しました')
    }
  }

  if (status === 'loading') {
    return <div className="p-4">Loading...</div>
  }

  if (status === 'authenticated') {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ログイン
          </h2>
          {searchParams.get('registered') === 'true' && (
            <p className="mt-2 text-center text-sm text-green-600">
              登録が完了しました。ログインしてください。
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                メールアドレス
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                data-cy="email-input"
                className="rounded-t-md"
                placeholder="メールアドレス"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                パスワード
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                data-cy="password-input"
                className="rounded-b-md"
                placeholder="パスワード"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center" role="alert">
              {error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              data-cy="login-button"
              className="w-full"
            >
              ログイン
            </Button>
          </div>

          <div className="text-sm text-center">
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              新規登録はこちら
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}