import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminNavbar } from '@/components/admin/AdminNavbar'
import { StarfieldBackground } from '@/components/ui/StarfieldBackground'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-space-black relative">
      {/* Fondo espacial global para el panel */}
      <StarfieldBackground />
      
      {/* Sidebar de navegación */}
      <AdminSidebar />
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <AdminNavbar userEmail={user.email} />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
