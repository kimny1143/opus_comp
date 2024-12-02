import Header from './Header'
import Sidebar from './Sidebar'

type LayoutProps = {
  children: React.ReactNode
  showHeader?: boolean
  showSidebar?: boolean
}

export default function Layout({ 
  children, 
  showHeader = true,
  showSidebar = true 
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      {showHeader && <Header />}
      <div className="flex">
        {showSidebar && <Sidebar />}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 