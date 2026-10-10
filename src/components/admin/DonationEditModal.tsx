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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A0A0E]/80 backdrop-blur-sm">
      <div className="bg-[#17171a] border border-[#262629] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#262629] bg-[#1b1b1f]">
          <div>
            <h2 className="text-xl font-semibold text-white font-montserrat">Gestionar Donación</h2>
            <p className="text-sm text-[#99907c] mt-1">Donante: <span className="text-[#d0c5af]">{request.donor_name}</span></p>
          </div>
          <button onClick={onClose} className="text-[#99907c] hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {error && (
            <div className="bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="mb-6 bg-[#1b1b1f] border border-[#262629] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-[#99907c] font-montserrat">Contacto y Tipo</span>
              <span className="text-[#e4e1e7] text-sm">{request.email} • {request.phone || 'Sin teléfono'}</span>
              <span className="text-[#D4AF37] text-xs uppercase mt-1">Aporte: {request.donation_type}</span>
            </div>
            <div className="flex flex-col pt-2 border-t border-[#262629]">
              <span className="text-[10px] uppercase tracking-widest text-[#99907c] font-montserrat">Mensaje Original</span>
              <span className="text-[#d0c5af] text-sm mt-1">{request.message || 'Sin mensaje adicional'}</span>
            </div>
          </div>

          <form id="edit-donation-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#d0c5af]">Estado de Donación <span className="text-[#ffb4ab]">*</span></label>
                <select required name="status" defaultValue={request.status} className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none">
                  <option value="nueva">Nueva (Sin contactar)</option>
                  <option value="en_contacto">En Contacto (Negociando)</option>
                  <option value="concretada">Concretada (Donación recibida)</option>
                  <option value="descartada">Descartada</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#d0c5af]">Monto Final (COP)</label>
                <input 
                  type="number" 
                  name="amount_cop" 
                  defaultValue={request.amount_cop || ''}
                  min="0"
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" 
                  placeholder="Ej. 500000"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-[#d0c5af]">Notas Internas (Solo Administradores)</label>
                <textarea 
                  name="admin_notes" 
                  defaultValue={request.admin_notes || ''} 
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors min-h-[100px] resize-y" 
                  placeholder="Ej. Se emitirá el certificado de donación la próxima semana..."
                />
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-[#262629] bg-[#1b1b1f] flex justify-end gap-4">
          <button 
            type="button" 
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-[#d0c5af] hover:bg-[#262629] transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="edit-donation-form"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Guardando...' : <><CheckCircle2 className="w-4 h-4" /> Guardar Cambios</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
