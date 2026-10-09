import { redirect } from 'next/navigation';
import { createServerClient } from '@/services/supabase/server';
import { LogOut } from 'lucide-react';
import { signout } from './actions';
import { SidebarNav } from './SidebarNav';
import { StarfieldBackground } from '@/components/ui/StarfieldBackground';
import { EarthBackground } from '@/components/ui/EarthBackground';

export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const userFullName = profile?.full_name || user.user_metadata?.full_name || 'Sin Nombre';

  return (
    <div className="h-screen bg-transparent flex text-[#e4e1e7] font-inter overflow-hidden relative">
      <StarfieldBackground />
      <EarthBackground />
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

        <SidebarNav />

        <div className="p-6 mt-auto border-t border-[#262629] flex-shrink-0">
          <div className="bg-[#1b1b1f] rounded-xl p-4 flex items-center gap-3 mb-4 border border-[#262629]">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37] flex items-center justify-center text-[#0A0A0E] font-bold font-montserrat text-lg flex-shrink-0">
              {(userFullName[0] || user.email?.[0] || 'A').toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-[#e4e1e7] truncate">{userFullName}</p>
              <p className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] truncate">
                Administrador
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
      <main className="flex-1 h-full overflow-y-auto bg-transparent relative z-10">
        <div className="p-10 w-full max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
