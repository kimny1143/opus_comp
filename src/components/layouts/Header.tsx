'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Bell, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { data: session } = useSession()
  const logoPath = process.env.NEXT_PUBLIC_COMPANY_LOGO_PATH || '/images/gw_logo.png'

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src={logoPath}
                alt="グラスワークス"
                width={40}
                height={40}
                className="mr-2"
              />
              <span className="text-xl font-bold text-gray-800">OPUS</span>
            </Link>
            <div className="ml-6 flex items-center">
              <Input
                className="w-64"
                type="search"
                placeholder="検索..."
              />
              <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {session && (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Bell className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{session.user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>プロフィール</DropdownMenuItem>
                  <DropdownMenuItem>設定</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    ログアウト
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 