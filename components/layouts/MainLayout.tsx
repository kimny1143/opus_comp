import React from 'react'
import SidebarNav from '@/components/ui/Sidebar'
import Header from '@/components/ui/Header'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <aside className="hidden w-[240px] border-r md:block">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">OPUS</h2>
          </div>
          <SidebarNav />
        </aside>
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 