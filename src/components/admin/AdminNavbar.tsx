import Link from 'next/link'
import { ExternalLink, User } from 'lucide-react'

export function AdminNavbar({ userEmail }: { userEmail: string | undefined }) {
  return (
    <header className="h-16 bg-space-card/60 backdrop-blur-md border-b border-space-border/80 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Área reservada para breadcrumbs si se requiere más adelante */}
      </div>

      <div className="flex items-center gap-6">
        <Link 
          href="/" 
          target="_blank"
          className="text-sm flex items-center gap-2 text-space-gray hover:text-gold-light transition-colors"
        >
          <span>Volver al sitio público</span>
          <ExternalLink size={14} />
        </Link>

        <div className="flex items-center gap-3 pl-6 border-l border-space-border/50">
          <div className="w-8 h-8 rounded-full bg-gold-primary/20 border border-gold-primary/30 flex items-center justify-center text-gold-primary">
            <User size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white leading-none">Admin</span>
            <span className="text-xs text-space-gray mt-1">{userEmail || 'admin@ejemplo.com'}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
