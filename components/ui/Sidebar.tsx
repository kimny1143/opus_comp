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

export default function SidebarNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
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
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/dashboard">ダッシュボード</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/vendors">取引先管理</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/orders">受発注管理</Link>
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
} 