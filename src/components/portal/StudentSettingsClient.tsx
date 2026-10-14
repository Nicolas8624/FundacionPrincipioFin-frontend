'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  MapPin, 
  ShieldCheck, 
  KeyRound, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Info,
  Calendar,
  Lock
} from 'lucide-react';
import { createBrowserClient } from '@/services/supabase/client';

export interface ProfileData {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  document_type?: string | null;
  document_number?: string | null;
  locality?: string | null;
  birth_date?: string | null;
  role?: string | null;
  created_at?: string;
}

interface StudentSettingsClientProps {
  initialProfile: ProfileData;
}

export function StudentSettingsClient({ initialProfile }: StudentSettingsClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(initialProfile);

  // Form fields
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [documentType, setDocumentType] = useState(profile.document_type || 'CC');
  const [documentNumber, setDocumentNumber] = useState(profile.document_number || '');
  const [locality, setLocality] = useState(profile.locality || 'Kennedy, Bogotá');
  const [birthDate, setBirthDate] = useState(profile.birth_date || '');

  // Statuses
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(false);

    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone: phone.trim(),
        document_type: documentType,
        document_number: documentNumber.trim(),
        locality: locality.trim(),
        birth_date: birthDate || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    setSavingProfile(false);

    if (error) {
      console.error('Error al actualizar perfil:', error);
      setProfileError(error.message || 'Error al guardar cambios');
    } else {
      setProfileSuccess(true);
      setProfile(prev => ({
        ...prev,
        full_name: fullName.trim(),
        phone: phone.trim(),
        document_type: documentType,
        document_number: documentNumber.trim(),
        locality: locality.trim(),
        birth_date: birthDate || null,
      }));
      router.refresh();
      setTimeout(() => setProfileSuccess(false), 4000);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError('Por favor ingresa tu contraseña actual.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las nuevas contraseñas no coinciden.');
      return;
    }

    setSavingPassword(true);
    const supabase = createBrowserClient();

    // 1. Validar la contraseña actual mediante reautenticación segura
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: currentPassword,
    });

    if (signInError) {
      setSavingPassword(false);
      setPasswordError('La contraseña actual es incorrecta. Por favor verifícala.');
      return;
    }

    // 2. Si la contraseña actual es correcta, actualizar a la nueva
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setSavingPassword(false);

    if (updateError) {
      console.error('Error al actualizar contraseña:', updateError);
      setPasswordError(updateError.message || 'Error al cambiar contraseña');
    } else {
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-8 pb-14 max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="space-y-2">
        <p className="text-[10px] font-montserrat uppercase tracking-[0.25em] text-[#D4AF37] font-semibold flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
          Configuración & Seguridad de Cuenta
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold font-montserrat tracking-tight text-white">
          Ajustes de Perfil y Preferencias
        </h1>
        <p className="text-sm text-[#99907c] max-w-3xl leading-relaxed">
          Mantén tus datos personales y de contacto actualizados para asegurar la correcta emisión de tus certificados de estudio y notificaciones de cursos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Formulario de Perfil (8 cols) */}
        <div className="lg:col-span-8 bg-[#17171a] border border-[#262629] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#262629]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1b1b1f] border border-[#333338] flex items-center justify-center text-[#D4AF37]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-montserrat text-white">
                  Información Personal y Ciudadana
                </h2>
                <p className="text-xs text-[#99907c]">
                  Datos utilizados para diplomas y matrícula institucional
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            {profileSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Tus datos han sido actualizados exitosamente en el sistema.</span>
              </div>
            )}

            {profileError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                  Nombre Completo <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                  Correo Electrónico (Cuenta de Acceso)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full bg-[#0A0A0E]/60 border border-[#262629] rounded-xl px-4 py-3 text-sm text-[#99907c] cursor-not-allowed"
                  />
                  <span className="absolute right-3.5 top-3.5 text-[10px] font-montserrat uppercase tracking-wider bg-[#1b1b1f] border border-[#262629] text-[#99907c] px-2 py-0.5 rounded">
                    Principal
                  </span>
                </div>
                <p className="text-[11px] text-[#99907c] mt-0.5">
                  El correo se encuentra verificado por Supabase Auth.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                  Tipo de Documento
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                >
                  <option value="CC">Cédula de Ciudadanía (CC)</option>
                  <option value="TI">Tarjeta de Identidad (TI)</option>
                  <option value="CE">Cédula de Extranjería (CE)</option>
                  <option value="PA">Pasaporte (PA)</option>
                  <option value="RC">Registro Civil (RC)</option>
                  <option value="Otro">Otro documento</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                  Número de Documento
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ej. 1012345678"
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                  Teléfono / Celular de Contacto
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+57 312 458 9210"
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                  Localidad de Residencia (Bogotá)
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                >
                  <option value="Bosa, Bogotá">Bosa</option>
                  <option value="Kennedy, Bogotá">Kennedy</option>
                  <option value="Suba, Bogotá">Suba</option>
                  <option value="Engativá, Bogotá">Engativá</option>
                  <option value="Teusaquillo, Bogotá">Teusaquillo</option>
                  <option value="Fontibón, Bogotá">Fontibón</option>
                  <option value="Ciudad Bolívar, Bogotá">Ciudad Bolívar</option>
                  <option value="Usme, Bogotá">Usme</option>
                  <option value="Usaquén, Bogotá">Usaquén</option>
                  <option value="Otra localidad">Otra localidad</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                  Fecha de Nacimiento (Opcional)
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-2 bg-[#D4AF37] text-[#0A0A0E] px-6 py-3 rounded-xl font-montserrat text-xs font-bold uppercase tracking-wider hover:bg-[#F5D77A] transition-all disabled:opacity-50 shadow-md shadow-[#D4AF37]/20"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando Cambios...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Información de Perfil</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Seguridad y Clave (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-[#262629]">
              <div className="w-8 h-8 rounded-lg bg-[#1b1b1f] border border-[#333338] flex items-center justify-center text-[#D4AF37]">
                <KeyRound className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-montserrat text-white">
                Seguridad de Acceso
              </h3>
            </div>

            <p className="text-xs text-[#99907c] leading-relaxed">
              Actualiza tu contraseña para mantener protegida tu cuenta del portal.
            </p>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Contraseña actualizada correctamente.</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Tu contraseña actual"
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full flex items-center justify-center gap-2 bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-white hover:text-[#D4AF37] py-2.5 rounded-xl font-montserrat text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Actualizando...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Cambiar Contraseña</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
