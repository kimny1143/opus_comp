import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

const navigation = [
  { name: 'dashboard', href: '/dashboard', icon: '📊' },
  { name: 'vendors', href: '/vendors', icon: '🏢' },
]

export default function Sidebar() {
  const router = useRouter()
  const { t } = useTranslation('common')

  return (
    <div className="w-64 bg-white shadow">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = router.pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md
                  ${isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <span className="mr-3">{item.icon}</span>
                {t(item.name)}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
} 