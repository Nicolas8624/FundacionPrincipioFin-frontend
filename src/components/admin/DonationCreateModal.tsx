'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface DonationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DonationCreateModal({ isOpen, onClose }: DonationCreateModalProps) {
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
      donor_name: formData.get('donor_name'),
      donation_type: formData.get('donation_type'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      amount_cop: formData.get('amount_cop') ? parseFloat(formData.get('amount_cop') as string) : null,
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
      .from('donation_requests')
      .insert([requestData]);

    if (insertError) {
      console.error(insertError);
      setError(insertError.message || 'Error al registrar donación');
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
            <h2 className="text-lg sm:text-xl font-semibold text-white font-montserrat truncate">Registrar Donación Manual</h2>
            <p className="text-xs sm:text-sm text-[#99907c] mt-0.5 sm:mt-1">Ingresa una donación o intención recibida por otros canales</p>
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

          <form id="create-donation-form" onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Nombre del Donante / Empresa <span className="text-[#ffb4ab]">*</span></label>
                <input required type="text" name="donor_name" placeholder="Ej. Juan Pérez o Empresa XYZ" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Correo Electrónico <span className="text-[#ffb4ab]">*</span></label>
                <input required type="email" name="email" placeholder="correo@ejemplo.com" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Teléfono / Celular</label>
                <input type="text" name="phone" placeholder="Ej. 3001234567" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Tipo de Aporte <span className="text-[#ffb4ab]">*</span></label>
                <select required name="donation_type" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none">
                  <option value="economico">Económico</option>
                  <option value="insumos">Insumos (Materiales)</option>
                  <option value="equipos">Equipos / Herramientas</option>
                  <option value="patrocinio">Patrocinio Institucional</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Monto (COP)</label>
                <input type="number" name="amount_cop" placeholder="Solo números, sin puntos" min="0" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
              </div>

              <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Estado Inicial <span className="text-[#ffb4ab]">*</span></label>
                <select required name="status" defaultValue="concretada" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none">
                  <option value="nueva">Nueva (Sin contactar)</option>
                  <option value="en_contacto">En Contacto (Negociando)</option>
                  <option value="concretada">Concretada (Donación recibida)</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Mensaje del Donante / Detalle</label>
                <textarea 
                  name="message" 
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors min-h-[80px] resize-y" 
                  placeholder="Detalles sobre los equipos donados o motivo de la donación..."
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Notas Internas del Administrador</label>
                <textarea 
                  name="admin_notes" 
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors min-h-[60px] resize-y" 
                  placeholder="Donación entregada en la sede central..."
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
            form="create-donation-form"
            disabled={loading}
            className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md shadow-[#D4AF37]/10"
          >
            {loading ? 'Guardando...' : <><CheckCircle2 className="w-4 h-4" /> Registrar Donación</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
