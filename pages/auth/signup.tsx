import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SignUp() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const res = await axios.post('/api/auth/signup', {
        name,
        email,
        password,
      })

      if (res.status === 201) {
        router.push('signin')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'サインアップに失敗しました。')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 p-8 bg-white shadow-md rounded">
        <h1 className="text-2xl font-bold text-center">サインアップ</h1>
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <label htmlFor="name" className="block text-sm font-medium">名前</label>
          <Input id="name" name="name" type="text" required />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">メールアドレス</label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">パスワード</label>
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'サインアップ中...' : 'サインアップ'}
        </Button>
        <p className="text-center">
          すでにアカウントをお持ちですか？{' '}
          <a href="/auth/signin" className="text-blue-500">サインイン</a>
        </p>
      </form>
    </div>
  )
} 