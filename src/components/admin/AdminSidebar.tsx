'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, HeartHandshake, Mail, Building, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Inscripciones', href: '/admin/inscripciones', icon: Users },
    { name: 'Solicitudes PH', href: '/admin/solicitudes-ph', icon: Building },
    { name: 'Donaciones', href: '/admin/donaciones', icon: HeartHandshake },
    { name: 'Mensajes', href: '/admin/mensajes', icon: Mail },
  ]

  return (
    <aside className="w-64 bg-space-card/80 border-r border-space-border/80 backdrop-blur-xl flex flex-col h-full relative z-20">
      {/* Logo Area */}
      <div className="p-6 border-b border-space-border/50">
        <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
          Panel <span className="text-gold-primary">Admin</span>
        </h2>
        <p className="text-xs text-space-gray mt-1">Principio & Fin</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-gold-primary/10 text-gold-primary border border-gold-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                  : 'text-space-gray hover:text-white hover:bg-space-border/30'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium text-sm">{link.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-space-border/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}
