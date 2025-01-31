'use client'

import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BaseFormWrapper } from '@/components/shared/form/BaseFormWrapper'
import { InputField } from '@/components/shared/form/InputField'
import { signinSchema, type SignInFormData } from '@/components/auth/schemas/signinSchema'
import { useEffect } from 'react'

export default function SignInForm() {
  const router = useRouter()
  const form = useForm<SignInFormData>({
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
    <Card className="w-full max-w-md" data-testid="signin-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">サインイン</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <BaseFormWrapper
          form={form}
          onSubmit={handleSubmit}
          data-testid="signin-form"
        >
          {(form) => (
            <div className="space-y-4">
              <InputField
                name="email"
                label="メールアドレス"
                type="email"
                control={form.control}
                required
                data-testid="email-input"
              />

              <InputField
                name="password"
                label="パスワード"
                type="password"
                control={form.control}
                required
                data-testid="password-input"
              />
            </div>
          )}
        </BaseFormWrapper>

        <div className="text-sm text-center">
          <span className="text-gray-500">アカウントをお持ちでない方は</span>
          <Link
            href="/auth/signup"
            className="font-medium text-primary hover:text-primary/80 ml-1"
          >
            新規登録
          </Link>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">または</span>
          </div>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full"
        >
          Googleでサインイン
        </Button>
      </CardContent>
    </Card>
  )
} 