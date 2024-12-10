import React from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

const navigationItems = [
  { name: 'ダッシュボード', href: '/dashboard' },
  { name: '取引先管理', href: '/vendors' },
  { name: '受発注管理', href: '/orders' },
]

export default function SidebarNav() {
  return (
    <>
      {/* モバイル用メニュー */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">メニューを開く</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-0">
            <SheetHeader className="p-4 border-b">
              <h2 className="text-xl font-bold">OPUS</h2>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-4rem)]">
              <div className="space-y-1 p-2">
                {navigationItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href={item.href}>{item.name}</Link>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* デスクトップ用サイドバー */}
      <nav className="hidden md:block p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <Link href={item.href}>{item.name}</Link>
            </Button>
          ))}
        </div>
      </nav>
    </>
  )
} 