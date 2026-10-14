'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface DonationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
}

export function DonationEditModal({ isOpen, onClose, request }: DonationEditModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || !request) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    const requestData = {
      status: formData.get('status'),
      amount_cop: formData.get('amount_cop') ? parseFloat(formData.get('amount_cop') as string) : null,
      admin_notes: formData.get('admin_notes'),
    };

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: updateError } = await supabase
      .from('donation_requests')
      .update(requestData)
      .eq('id', request.id);

    if (updateError) {
      console.error(updateError);
      setError(updateError.message || 'Error al actualizar la donación');
      setLoading(false);
    } else {
      router.refresh(); 
      onClose();
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-[#0A0A0E]/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#17171a] border border-[#262629] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#262629] bg-[#1b1b1f] shrink-0">
          <div className="min-w-0 pr-2">
            <h2 className="text-lg sm:text-xl font-semibold text-white font-montserrat truncate">Gestionar Donación</h2>
            <p className="text-xs sm:text-sm text-[#99907c] mt-0.5 sm:mt-1 truncate">Donante: <span className="text-[#d0c5af]">{request.donor_name}</span></p>
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

          <div className="mb-4 sm:mb-6 bg-[#1b1b1f] border border-[#262629] rounded-xl p-3 sm:p-4 flex flex-col gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-[#99907c] font-montserrat">Contacto y Tipo</span>
              <span className="text-[#e4e1e7] text-xs sm:text-sm font-medium">{request.email} • {request.phone || 'Sin teléfono'}</span>
              <span className="text-[#D4AF37] text-xs uppercase mt-0.5">Aporte: {request.donation_type}</span>
            </div>
            <div className="flex flex-col pt-2 border-t border-[#262629]">
              <span className="text-[10px] uppercase tracking-widest text-[#99907c] font-montserrat">Mensaje Original</span>
              <span className="text-[#d0c5af] text-xs sm:text-sm mt-1 leading-relaxed">{request.message || 'Sin mensaje adicional'}</span>
            </div>
          </div>

          <form id="edit-donation-form" onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Estado de Donación <span className="text-[#ffb4ab]">*</span></label>
                <select required name="status" defaultValue={request.status} className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none">
                  <option value="nueva">Nueva (Sin contactar)</option>
                  <option value="en_contacto">En Contacto (Negociando)</option>
                  <option value="concretada">Concretada (Donación recibida)</option>
                  <option value="descartada">Descartada</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Monto Final (COP)</label>
                <input 
                  type="number" 
                  name="amount_cop" 
                  defaultValue={request.amount_cop || ''}
                  min="0"
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors" 
                  placeholder="Ej. 500000"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Notas Internas (Solo Administradores)</label>
                <textarea 
                  name="admin_notes" 
                  defaultValue={request.admin_notes || ''} 
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors min-h-[100px] resize-y" 
                  placeholder="Ej. Se emitirá el certificado de donación la próxima semana..."
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
            form="edit-donation-form"
            disabled={loading}
            className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md shadow-[#D4AF37]/10"
          >
            {loading ? 'Guardando...' : <><CheckCircle2 className="w-4 h-4" /> Guardar Cambios</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
