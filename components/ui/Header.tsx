import React from 'react'
import { Bell, ChevronDown, Globe, Moon, Search, Sun, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Header() {
  const { setTheme, theme } = useTheme()
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignOut = () => {
    signOut()
  }

  return (
    <header className="flex h-16 items-center justify-between border-b px-4">
      <div className="flex items-center">
        <h1 className="text-xl font-bold mr-4">OPUS</h1>
        <Input className="mr-2 w-64" placeholder="検索..." type="search" />
        <Button size="icon" variant="ghost">
          <Search className="h-4 w-4" />
          <span className="sr-only">検索</span>
        </Button>
      </div>
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <Globe className="h-4 w-4" />
              <span className="sr-only">言語切替</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>日本語</DropdownMenuItem>
            <DropdownMenuItem>English</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          size="icon"
          variant="ghost"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          <span className="sr-only">テーマ切替</span>
        </Button>
        <Button size="icon" variant="ghost">
          <Bell className="h-4 w-4" />
          <span className="sr-only">通知</span>
        </Button>
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center space-x-2" variant="ghost">
                <User className="h-4 w-4" />
                <span>{session.user?.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>プロフィール</DropdownMenuItem>
              <DropdownMenuItem>設定</DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>ログアウト</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={() => router.push('/auth/signin')}>サインイン</Button>
        )}
      </div>
    </header>
  )
}