'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface PhCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PhCreateModal({ isOpen, onClose }: PhCreateModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    const requestData = {
      complex_name: formData.get('complex_name'),
      administrator_name: formData.get('administrator_name'),
      role_title: formData.get('role_title'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      locality: formData.get('locality'),
      address: formData.get('address'),
      residents_count: formData.get('residents_count') ? parseInt(formData.get('residents_count') as string, 10) : null,
      message: formData.get('message'),
      status: formData.get('status'),
      admin_notes: formData.get('admin_notes'),
      accepted_data_policy: true,
    };

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: insertError } = await supabase
      .from('ph_requests')
      .insert([requestData]);

    if (insertError) {
      console.error(insertError);
      setError(insertError.message || 'Error al crear la solicitud');
      setLoading(false);
    } else {
      router.refresh(); 
      onClose();
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-[#0A0A0E]/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#17171a] border border-[#262629] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#262629] bg-[#1b1b1f] shrink-0">
          <div className="min-w-0 pr-2">
            <h2 className="text-lg sm:text-xl font-semibold text-white font-montserrat truncate">Nueva Solicitud PH (Manual)</h2>
            <p className="text-xs sm:text-sm text-[#99907c] mt-0.5 sm:mt-1">Registra un conjunto/edificio contactado por fuera de la plataforma</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#262629] text-[#99907c] hover:text-white flex items-center justify-center transition-colors shrink-0">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar min-h-0">
          {error && (
            <div className="bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form id="create-ph-form" onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Nombre del Conjunto / Edificio <span className="text-[#ffb4ab]">*</span></label>
                <input required type="text" name="complex_name" placeholder="Ej. Conjunto Residencial Los Pinos" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Nombre del Contacto <span className="text-[#ffb4ab]">*</span></label>
                <input required type="text" name="administrator_name" placeholder="Nombres y apellidos" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Cargo / Rol <span className="text-[#ffb4ab]">*</span></label>
                <select required name="role_title" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none">
                  <option value="Administrador">Administrador(a)</option>
                  <option value="Miembro del consejo">Miembro del consejo</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Correo Electrónico <span className="text-[#ffb4ab]">*</span></label>
                <input required type="email" name="email" placeholder="administracion@conjunto.com" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Teléfono / Celular <span className="text-[#ffb4ab]">*</span></label>
                <input required type="text" name="phone" placeholder="Ej. 3001234567" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Localidad <span className="text-[#ffb4ab]">*</span></label>
                <input required type="text" name="locality" placeholder="Ej. Suba, Usaquén, etc." className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Dirección / Barrio</label>
                <input type="text" name="address" placeholder="Ej. Calle 123 #45-67" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Número de Apartamentos</label>
                <input type="number" name="residents_count" placeholder="Ej. 120" min="0" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Estado Inicial <span className="text-[#ffb4ab]">*</span></label>
                <select required name="status" defaultValue="pendiente" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none">
                  <option value="pendiente">Pendiente (Requiere visita técnica)</option>
                  <option value="en_revision">En Revisión (Comité evaluando)</option>
                  <option value="aprobada">Aprobada (Convenio firmado)</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Mensaje / Detalles Adicionales</label>
                <textarea 
                  name="message" 
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors min-h-[80px] resize-y" 
                  placeholder="Detalles sobre el interés del conjunto en los programas..."
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Notas Internas del Administrador</label>
                <textarea 
                  name="admin_notes" 
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors min-h-[60px] resize-y" 
                  placeholder="Visita técnica programada para..."
                />
              </div>

            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 sm:py-4 border-t border-[#262629] bg-[#1b1b1f] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-[#d0c5af] hover:bg-[#262629] transition-colors text-center"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="create-ph-form"
            disabled={loading}
            className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md shadow-[#D4AF37]/10"
          >
            {loading ? 'Guardando...' : <><CheckCircle2 className="w-4 h-4" /> Registrar Solicitud</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
