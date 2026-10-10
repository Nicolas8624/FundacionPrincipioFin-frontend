'use client';

import { useState, useEffect } from 'react';
import { Save, Database, Bell, CheckCircle2, User } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export function SettingsForm({ profile }: { profile: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [notifications, setNotifications] = useState({
    inscriptions: true,
    phRequests: true,
    reports: false
  });

  useEffect(() => {
    const saved = localStorage.getItem('admin_notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  const handleToggle = (key: keyof typeof notifications) => {
    const newNotifications = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifications);
    localStorage.setItem('admin_notifications', JSON.stringify(newNotifications));
  };

  const handleSubmitProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.get('full_name'),
        phone: formData.get('phone'),
      })
      .eq('id', profile.id);

    if (error) {
      setMessage({ type: 'error', text: 'Error al actualizar tu perfil.' });
    } else {
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
      router.refresh();
      setTimeout(() => setMessage(null), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      
      {/* Columna Izquierda: Perfil (Editable) */}
      <div className="space-y-8">
        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]' : 'bg-[#93000a]/10 border border-[#93000a]/30 text-[#ffb4ab]'}`}>
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <section className="bg-[#17171a] border border-[#262629] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-[#262629] bg-[#1b1b1f] flex items-center gap-3">
            <User className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold text-[#e4e1e7]">Perfil del Administrador</h2>
          </div>
          <form onSubmit={handleSubmitProfile} className="p-8 space-y-6">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-2">Nombre Completo</label>
                <input 
                  name="full_name"
                  type="text" 
                  defaultValue={profile?.full_name || ''} 
                  required
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-3 text-[#e4e1e7] text-sm focus:border-[#D4AF37] focus:outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-2">Teléfono / Celular</label>
                <input 
                  name="phone"
                  type="text" 
                  defaultValue={profile?.phone || ''} 
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-3 text-[#e4e1e7] text-sm focus:border-[#D4AF37] focus:outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-2">Correo Electrónico (Solo Lectura)</label>
                <input 
                  type="email" 
                  defaultValue={profile?.email || ''} 
                  disabled
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-3 text-[#99907c] text-sm opacity-60 cursor-not-allowed" 
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-[#262629]">
               <button 
                  type="submit"
                  disabled={loading}
                  className="bg-[#D4AF37] text-[#0A0A0E] px-6 py-3 rounded-lg font-semibold tracking-wider uppercase text-xs font-montserrat hover:bg-[#F5D77A] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                 {loading ? 'Guardando...' : <><Save className="w-4 h-4" /> Guardar Perfil</>}
               </button>
            </div>
          </form>
        </section>
      </div>

      {/* Columna Derecha: Sistema y Notificaciones */}
      <div className="space-y-8">
        
        <section className="bg-[#17171a] border border-[#262629] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-[#262629] bg-[#1b1b1f] flex items-center gap-3">
            <Bell className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold text-[#e4e1e7]">Preferencias de Interfaz</h2>
          </div>
          <div className="p-8 space-y-4">
            <ToggleOption 
              title="Alertas de nuevas inscripciones" 
              description="Mostrar indicadores visuales cuando haya inscripciones pendientes en las tablas." 
              active={notifications.inscriptions}
              onToggle={() => handleToggle('inscriptions')}
            />
            <ToggleOption 
              title="Destacar Solicitudes PH" 
              description="Resaltar en color dorado las solicitudes de conjuntos recién creadas." 
              active={notifications.phRequests}
              onToggle={() => handleToggle('phRequests')}
            />
            <ToggleOption 
              title="Modo alto contraste (Lectura)" 
              description="Aumentar la legibilidad de las tablas de datos para mayor accesibilidad." 
              active={notifications.reports}
              onToggle={() => handleToggle('reports')}
            />
          </div>
        </section>

        <section className="bg-[#17171a] border border-[#262629] rounded-2xl overflow-hidden opacity-80 shadow-xl">
          <div className="p-6 border-b border-[#262629] bg-[#1b1b1f] flex items-center gap-3">
            <Database className="w-5 h-5 text-[#99907c]" />
            <h2 className="text-lg font-semibold text-[#e4e1e7]">Información Institucional</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-2">Organización</label>
                <input type="text" defaultValue="Fundación Principio & Fin" disabled className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-3 text-[#99907c] text-sm cursor-not-allowed" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-2">NIT</label>
                  <input type="text" defaultValue="901.442.231-1" disabled className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-3 text-[#99907c] text-sm cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-2">Versión de Plataforma</label>
                  <input type="text" defaultValue="v2.4.0 (Build 2026)" disabled className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-3 text-[#99907c] text-sm cursor-not-allowed" />
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

function ToggleOption({ title, description, active = false, onToggle }: { title: string, description: string, active?: boolean, onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#262629] last:border-0 last:pb-0">
      <div className="pr-4">
        <p className="text-sm font-semibold text-[#e4e1e7] mb-1">{title}</p>
        <p className="text-xs text-[#99907c] leading-relaxed">{description}</p>
      </div>
      <div 
        onClick={onToggle}
        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors shrink-0 ${active ? 'bg-[#D4AF37]' : 'bg-[#262629]'}`}
      >
        <div className={`w-4 h-4 rounded-full bg-[#0A0A0E] transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </div>
    </div>
  )
}
