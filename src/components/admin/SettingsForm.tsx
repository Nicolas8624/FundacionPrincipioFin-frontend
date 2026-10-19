'use client';

import { useState } from 'react';
import { 
  Save, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ShieldCheck 
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export function SettingsForm({ profile }: { profile: any }) {
  const router = useRouter();
  
  // Estado para actualización de perfil
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Estado para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmitProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

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
      setProfileMessage({ type: 'error', text: 'Error al actualizar tu perfil.' });
    } else {
      setProfileMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
      router.refresh();
      setTimeout(() => setProfileMessage(null), 3000);
    }
    setProfileLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Ingresa tu contraseña actual.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'La nueva contraseña debe tener mínimo 6 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'La nueva contraseña y su confirmación no coinciden.' });
      return;
    }

    setPasswordLoading(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      // 1. Validar la contraseña actual autenticando
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile?.email,
        password: currentPassword,
      });

      if (signInError) {
        setPasswordMessage({ 
          type: 'error', 
          text: 'La contraseña actual ingresada es incorrecta. Por favor verifica e intenta de nuevo.' 
        });
        setPasswordLoading(false);
        return;
      }

      // 2. Actualizar a la nueva contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setPasswordMessage({ 
          type: 'error', 
          text: updateError.message || 'Error al actualizar la contraseña.' 
        });
      } else {
        setPasswordMessage({ 
          type: 'success', 
          text: '¡Tu contraseña ha sido actualizada exitosamente!' 
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMessage(null), 4000);
      }
    } catch (err: any) {
      setPasswordMessage({ 
        type: 'error', 
        text: err?.message || 'Error inesperado al cambiar contraseña.' 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
      
      {/* Columna Izquierda: Perfil (Editable) */}
      <div className="space-y-6 sm:space-y-8">
        {profileMessage && (
          <div className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in ${profileMessage.type === 'success' ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]' : 'bg-[#93000a]/10 border border-[#93000a]/30 text-[#ffb4ab]'}`}>
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-xs sm:text-sm font-medium">{profileMessage.text}</p>
          </div>
        )}

        <section className="bg-[#17171a] border border-[#262629] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 sm:p-6 border-b border-[#262629] bg-[#1b1b1f] flex items-center gap-3">
            <User className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold text-[#e4e1e7]">Perfil del Administrador</h2>
          </div>
          <form onSubmit={handleSubmitProfile} className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-2">Nombre Completo</label>
                <input 
                  name="full_name"
                  type="text" 
                  defaultValue={profile?.full_name || ''} 
                  required
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-[#e4e1e7] text-xs sm:text-sm focus:border-[#D4AF37] focus:outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-2">Teléfono / Celular</label>
                <input 
                  name="phone"
                  type="text" 
                  defaultValue={profile?.phone || ''} 
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-[#e4e1e7] text-xs sm:text-sm focus:border-[#D4AF37] focus:outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-2">Correo Electrónico (Solo Lectura)</label>
                <input 
                  type="email" 
                  defaultValue={profile?.email || ''} 
                  disabled
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-[#99907c] text-xs sm:text-sm opacity-60 cursor-not-allowed" 
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end pt-4 border-t border-[#262629]">
               <button 
                  type="submit"
                  disabled={profileLoading}
                  className="w-full sm:w-auto justify-center bg-[#D4AF37] text-[#0A0A0E] px-6 py-2.5 sm:py-3 rounded-lg font-semibold tracking-wider uppercase text-xs font-montserrat hover:bg-[#F5D77A] transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                 {profileLoading ? 'Guardando...' : <><Save className="w-4 h-4" /> Guardar Perfil</>}
               </button>
            </div>
          </form>
        </section>

        {/* Información Institucional */}
        <section className="bg-[#17171a] border border-[#262629] rounded-2xl overflow-hidden opacity-90 shadow-xl">
          <div className="p-4 sm:p-6 border-b border-[#262629] bg-[#1b1b1f] flex items-center gap-3">
            <Database className="w-5 h-5 text-[#99907c] shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold text-[#e4e1e7]">Información Institucional</h2>
          </div>
          <div className="p-4 sm:p-6 md:p-8 space-y-4">
            <div>
              <label className="block text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-1.5">Organización</label>
              <input type="text" defaultValue="Fundación Principio & Fin" disabled className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 py-2.5 text-[#99907c] text-xs sm:text-sm cursor-not-allowed" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-1.5">NIT</label>
                <input type="text" defaultValue="901.442.231-1" disabled className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 py-2.5 text-[#99907c] text-xs sm:text-sm cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-1.5">Versión Plataforma</label>
                <input type="text" defaultValue="v2.5.0 (Build 2026)" disabled className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 py-2.5 text-[#99907c] text-xs sm:text-sm cursor-not-allowed" />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Columna Derecha: Cambio de Contraseña */}
      <div className="space-y-6 sm:space-y-8">
        
        {passwordMessage && (
          <div className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in ${passwordMessage.type === 'success' ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]' : 'bg-[#93000a]/10 border border-[#93000a]/30 text-[#ffb4ab]'}`}>
            {passwordMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <p className="text-xs sm:text-sm font-medium">{passwordMessage.text}</p>
          </div>
        )}

        <section className="bg-[#17171a] border border-[#262629] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 sm:p-6 border-b border-[#262629] bg-[#1b1b1f] flex items-center gap-3">
            <KeyRound className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#e4e1e7]">Cambiar Contraseña</h2>
              <p className="text-xs text-[#99907c] mt-0.5">Mantén tu cuenta protegida con una contraseña segura</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            
            {/* Campo 1: Contraseña Actual */}
            <div>
              <label className="block text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-2">
                Contraseña Actual <span className="text-[#D4AF37]">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Tu contraseña actual"
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg pl-3.5 pr-11 py-2.5 sm:py-3 text-[#e4e1e7] text-xs sm:text-sm focus:border-[#D4AF37] focus:outline-none transition-colors" 
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#99907c] hover:text-[#e4e1e7] transition-colors"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Campo 2: Nueva Contraseña */}
            <div>
              <label className="block text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-2">
                Nueva Contraseña <span className="text-[#D4AF37]">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg pl-3.5 pr-11 py-2.5 sm:py-3 text-[#e4e1e7] text-xs sm:text-sm focus:border-[#D4AF37] focus:outline-none transition-colors" 
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#99907c] hover:text-[#e4e1e7] transition-colors"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Campo 3: Confirmar Nueva Contraseña */}
            <div>
              <label className="block text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-2">
                Confirmar Nueva Contraseña <span className="text-[#D4AF37]">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Repite la nueva contraseña"
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg pl-3.5 pr-11 py-2.5 sm:py-3 text-[#e4e1e7] text-xs sm:text-sm focus:border-[#D4AF37] focus:outline-none transition-colors" 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#99907c] hover:text-[#e4e1e7] transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Aviso de seguridad */}
            <div className="flex items-start gap-2.5 text-xs text-[#99907c] bg-[#141417] p-3 rounded-xl border border-[#262629]">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <span>
                Por seguridad, tu sesión continuará activa en este dispositivo pero se requerirá la nueva clave en los próximos inicios de sesión.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-end pt-4 border-t border-[#262629]">
              <button 
                type="submit"
                disabled={passwordLoading}
                className="w-full sm:w-auto justify-center bg-[#D4AF37] text-[#0A0A0E] px-6 py-2.5 sm:py-3 rounded-lg font-semibold tracking-wider uppercase text-xs font-montserrat hover:bg-[#F5D77A] transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {passwordLoading ? 'Actualizando...' : <><KeyRound className="w-4 h-4" /> Actualizar Contraseña</>}
              </button>
            </div>

          </form>
        </section>

      </div>
    </div>
  );
}
