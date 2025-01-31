'use client'

import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/shared/form/InputField'
import { signinSchema, type SignInFormData } from '@/components/auth/schemas/signinSchema'
import { useEffect } from 'react'

export default function SignInForm() {
  const router = useRouter()
  const methods = useForm<SignInFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  // デバッグ用：コンポーネントのマウント確認
  useEffect(() => {
    console.log('SignInForm mounted')
  }, [])

  const handleSubmit = async (data: SignInFormData) => {
    try {
      console.log('Form submitted:', data) // デバッグ用
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: true,
        callbackUrl: '/dashboard'
      })

      if (result?.error) {
        throw new Error('メールアドレスまたはパスワードが正しくありません')
      }
    } catch (error) {
      console.error('サインインエラー:', error)
      throw error
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">サインイン</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-4" data-testid="signin-form">
              <InputField
                name="email"
                label="メールアドレス"
                type="email"
                control={methods.control}
                required
                data-testid="email-input"
                className="w-full"
              />

              <InputField
                name="password"
                label="パスワード"
                type="password"
                control={methods.control}
                required
                data-testid="password-input"
                className="w-full"
              />

              <Button type="submit" className="w-full">
                サインイン
              </Button>
            </form>
          </FormProvider>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">または</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="mt-4 w-full"
            >
              Googleでサインイン
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">アカウントをお持ちでない方は</span>
            <Link
              href="/auth/signup"
              className="font-medium text-primary hover:text-primary/80 ml-1"
            >
              新規登録
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 