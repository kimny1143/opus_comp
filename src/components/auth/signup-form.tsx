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
import { signUpSchema } from '@/types/validation/authSchema'
import { SignUpFormData } from '@/types/validation/authSchema'
import { useFormError } from '@/components/shared/hooks/useFormError'

export default function SignUpForm() {
  const router = useRouter()
  const { formError, handleError, clearError } = useFormError()

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    mode: 'onChange'
  })

  const handleSubmit = async (data: SignUpFormData) => {
    try {
      clearError()
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 400 && result.message.includes('既に登録されています')) {
          form.setError('email', {
            type: 'manual',
            message: 'このメールアドレスは既に登録されています'
          })
        } else {
          throw new Error(result.message || 'サインアップに失敗しました')
        }
        return
      }

      // サインアップ成功時の処理
      router.push('/auth/signin')
    } catch (error) {
      handleError(error)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">アカウント作成</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">アカウント作成</h1>
          <p className="text-sm text-gray-600">
            必要な情報を入力してアカウントを作成してください
          </p>
        </div>

        {formError && (
          <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm" data-cy="form-error">
            {formError}
          </div>
        )}

        <BaseFormWrapper
          form={form}
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <div>
              <InputField
                name="email"
                label="メールアドレス"
                type="email"
                control={form.control}
                required
                data-cy="email-input"
              />
              {form.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600" data-cy="email-error">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <InputField
                name="password"
                label="パスワード"
                type="password"
                control={form.control}
                required
                data-cy="password-input"
              />
              {form.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600" data-cy="password-error">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <InputField
                name="confirmPassword"
                label="パスワード（確認）"
                type="password"
                control={form.control}
                required
                data-cy="confirm-password-input"
              />
              {form.formState.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600" data-cy="confirm-password-error">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              data-cy="submit-button"
            >
              アカウント作成
            </Button>
          </div>
        </BaseFormWrapper>

        <div className="text-sm text-center">
          <span className="text-gray-500">すでにアカウントをお持ちの方は</span>
          <Link
            href="/auth/signin"
            className="font-medium text-primary hover:text-primary/80 ml-1"
          >
            サインイン
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
          Googleで登録
        </Button>
      </CardContent>
    </Card>
  )
} 