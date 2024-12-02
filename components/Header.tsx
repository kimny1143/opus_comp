import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

export default function Header() {
  const { data: session } = useSession()
  const { t } = useTranslation('common')

  return (
    <header className="bg-white shadow">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              OPUS
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {session?.user && (
              <>
                <span className="text-sm text-gray-700">
                  {session.user.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  {t('signOut')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 