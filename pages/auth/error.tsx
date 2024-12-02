import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Error() {
  const router = useRouter()
  const { error } = router.query

  const errorMessages: { [key: string]: string } = {
    Configuration: '認証の設定に問題が発生しました',
    AccessDenied: 'アクセスが拒否されました',
    Verification: 'メールアドレスの確認が必要です',
    Default: '認証中にエラーが発生しました'
  }

  const message = error ? errorMessages[error as string] || errorMessages.Default : errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow text-center">
        <div>
          <h2 className="text-2xl font-bold text-red-600">エラー</h2>
          <p className="mt-2 text-gray-600">{message}</p>
        </div>
        <div className="space-y-4">
          <Link 
            href="/auth/signin"
            className="block w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            サインインに戻る
          </Link>
          <Link 
            href="/"
            className="block w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            トップページへ
          </Link>
        </div>
      </div>
    </div>
  )
} 