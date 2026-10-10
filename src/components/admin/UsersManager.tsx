'use client';

import { useState } from 'react';
import { Shield, ShieldAlert, UserCheck, UserX, User } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export function UsersManager({ users, currentUserId }: { users: any[], currentUserId: string }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleToggleRole = async (userId: string, currentRole: string) => {
    if (userId === currentUserId) {
      alert("No puedes cambiar tu propio rol.");
      return;
    }

    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`¿Estás seguro de cambiar el rol a ${newRole.toUpperCase()}?`)) return;

    setLoadingId(userId);
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      alert('Error al actualizar el rol');
    } else {
      router.refresh();
    }
    setLoadingId(null);
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (userId === currentUserId) {
      alert("No puedes desactivar tu propia cuenta.");
      return;
    }

    const newStatus = !currentStatus;
    if (!confirm(`¿Estás seguro de ${newStatus ? 'activar' : 'desactivar'} este usuario?`)) return;

    setLoadingId(userId);
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: newStatus })
      .eq('id', userId);

    if (error) {
      alert('Error al actualizar el estado');
    } else {
      router.refresh();
    }
    setLoadingId(null);
  };

  return (
    <div className="bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-[#262629] bg-[#1b1b1f] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="text-lg font-semibold text-[#e4e1e7]">Control de Acceso</h2>
        </div>
        <p className="text-xs text-[#99907c]">Total de usuarios registrados: <span className="text-white font-medium">{users.length}</span></p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-[#1b1b1f]/50 border-b border-[#262629] text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">
              <th className="px-6 py-5 font-semibold">Usuario</th>
              <th className="px-6 py-5 font-semibold">Contacto</th>
              <th className="px-6 py-5 font-semibold">Rol</th>
              <th className="px-6 py-5 font-semibold">Estado</th>
              <th className="px-6 py-5 font-semibold text-right">Acciones Administrativas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262629]">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-[#1b1b1f]/40 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#262629] flex items-center justify-center text-[#d0c5af] flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[#e4e1e7] font-medium text-sm">{user.full_name || 'Sin Nombre'}</p>
                      <p className="text-[10px] text-[#99907c] mt-0.5">ID: {user.id.substring(0, 8)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-[#d0c5af]">
                  <p>{user.email}</p>
                  <p className="text-[#99907c]">{user.phone || 'Sin teléfono'}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-montserrat uppercase tracking-widest font-semibold border ${user.role === 'admin' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30' : 'bg-[#1b1b1f] text-[#99907c] border-[#262629]'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider border ${user.is_active ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-[#93000a] text-[#ffb4ab]'}`}>
                    {user.is_active ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleToggleRole(user.id, user.role)}
                      disabled={loadingId === user.id || user.id === currentUserId}
                      className="px-3 py-1.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-[#e4e1e7] text-xs font-medium hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                      title="Cambiar rol (Admin / User)"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {user.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(user.id, user.is_active)}
                      disabled={loadingId === user.id || user.id === currentUserId}
                      className={`px-3 py-1.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 ${user.is_active ? 'text-[#ffb4ab] hover:border-[#93000a]' : 'text-[#D4AF37] hover:border-[#D4AF37]'}`}
                    >
                      {user.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      {user.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
