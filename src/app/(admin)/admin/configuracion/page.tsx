import { createServerClient } from '@/services/supabase/server';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { UsersManager } from '@/components/admin/UsersManager';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Settings, Users } from 'lucide-react';

export default async function AdminConfiguracionPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const params = await searchParams;
  const tab = typeof params.tab === 'string' ? params.tab : 'perfil';

  // Solo traemos los usuarios si estamos en la pestaña de usuarios
  let usersList = [];
  if (tab === 'usuarios') {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    usersList = data || [];
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            Ajustes del Sistema
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold font-montserrat tracking-wide text-white">
            Configuración y Usuarios
          </h1>
          <p className="text-[#99907c] text-sm mt-3 max-w-2xl leading-relaxed">
            Gestiona tu información de perfil, preferencias del portal y administra los niveles de acceso de todos los usuarios registrados.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#262629]">
        <Link 
          href="?tab=perfil"
          className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors relative ${tab === 'perfil' ? 'text-[#D4AF37]' : 'text-[#99907c] hover:text-[#d0c5af]'}`}
        >
          <Settings className="w-4 h-4" />
          Ajustes y Perfil
          {tab === 'perfil' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37] rounded-t-full"></div>}
        </Link>
        <Link 
          href="?tab=usuarios"
          className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors relative ${tab === 'usuarios' ? 'text-[#D4AF37]' : 'text-[#99907c] hover:text-[#d0c5af]'}`}
        >
          <Users className="w-4 h-4" />
          Usuarios del Sistema
          {tab === 'usuarios' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37] rounded-t-full"></div>}
        </Link>
      </div>

      {/* Content */}
      <div className="pt-4">
        {tab === 'perfil' ? (
          <SettingsForm profile={profile} />
        ) : (
          <UsersManager users={usersList} currentUserId={user.id} />
        )}
      </div>

    </div>
  );
}
