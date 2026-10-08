import { redirect } from 'next/navigation';
import { createServerClient } from '@/services/supabase/server';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, Users, Building, HeartHandshake, MessageSquare, Settings, LogOut } from 'lucide-react';
import { signout } from './actions';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="h-screen bg-[#111114] flex text-[#e4e1e7] font-inter overflow-hidden">
      {/* Sidebar Admin */}
      <aside className="w-[280px] bg-[#0A0A0E] flex flex-col flex-shrink-0 relative z-20 border-r border-[#262629] h-full">
        <div className="p-8 pb-6 flex-shrink-0">
          <img 
            src="/images/logo-admin.png" 
            alt="Logo" 
            className="h-10 object-contain"
          />
        </div>
        
        <div className="px-6 pb-2 flex-shrink-0">
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#99907c] mb-4">Administración</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#D4AF37] text-[#0A0A0E] font-medium text-sm transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Resumen
          </Link>
          <Link href="/admin/cursos" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#d0c5af] hover:bg-[#1b1b1f] hover:text-[#D4AF37] font-medium text-sm transition-colors">
            <BookOpen className="w-5 h-5" />
            Cursos
          </Link>
          <Link href="/admin/inscripciones" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#d0c5af] hover:bg-[#1b1b1f] hover:text-[#D4AF37] font-medium text-sm transition-colors">
            <Users className="w-5 h-5" />
            Inscripciones
          </Link>
          <Link href="/admin/solicitudes-ph" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#d0c5af] hover:bg-[#1b1b1f] hover:text-[#D4AF37] font-medium text-sm transition-colors">
            <Building className="w-5 h-5" />
            Solicitudes PH
          </Link>
          <Link href="/admin/donaciones" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#d0c5af] hover:bg-[#1b1b1f] hover:text-[#D4AF37] font-medium text-sm transition-colors">
            <HeartHandshake className="w-5 h-5" />
            Donaciones y alianzas
          </Link>
          <Link href="/admin/mensajes" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#d0c5af] hover:bg-[#1b1b1f] hover:text-[#D4AF37] font-medium text-sm transition-colors">
            <MessageSquare className="w-5 h-5" />
            Mensajes de contacto
          </Link>
          
          <div className="pt-6 pb-2 px-2">
            <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#99907c] mb-2">Ajustes</p>
          </div>
          
          <Link href="/admin/configuracion" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#d0c5af] hover:bg-[#1b1b1f] hover:text-[#D4AF37] font-medium text-sm transition-colors">
            <Settings className="w-5 h-5" />
            Ajustes del Sistema
          </Link>
        </nav>

        <div className="p-6 mt-auto border-t border-[#262629] flex-shrink-0">
          <div className="bg-[#1b1b1f] rounded-xl p-4 flex items-center gap-3 mb-4 border border-[#262629]">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37] flex items-center justify-center text-[#0A0A0E] font-bold font-montserrat text-lg flex-shrink-0">
              {user.email?.[0].toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-[#e4e1e7] truncate">Administrador</p>
              <p className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] truncate">
                {user.email}
              </p>
            </div>
          </div>

          <form action={signout}>
            <button className="flex items-center gap-2 text-sm text-[#ffb4ab] hover:text-[#ffded8] transition-colors font-medium">
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 h-full overflow-y-auto bg-[#111114]">
        <div className="p-10 w-full max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
