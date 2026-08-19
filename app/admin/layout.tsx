import { redirect } from 'next/navigation'
import { getAdminSessionWithUnreadCount } from '@/actions/auth'
import { Sidebar } from '@/components/admin/Sidebar'
import { Topbar } from '@/components/admin/Topbar'
import { TooltipProvider } from '@/components/ui/tooltip'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, unreadCount } = await getAdminSessionWithUnreadCount()
  if (!session) redirect('/login')

  return (
    <TooltipProvider>
      <div
        className="flex h-screen overflow-hidden"
        style={{ background: 'var(--background)' }}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar profile={session.profile} unreadCount={unreadCount} />
          <main
            className="flex-1 overflow-y-auto"
            style={{ background: 'var(--background)' }}
          >
            <div className="max-w-7xl mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}