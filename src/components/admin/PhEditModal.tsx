'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface PhEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
}

export function PhEditModal({ isOpen, onClose, request }: PhEditModalProps) {
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
      admin_notes: formData.get('admin_notes'),
    };

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: updateError } = await supabase
      .from('ph_requests')
      .update(requestData)
      .eq('id', request.id);

    if (updateError) {
      console.error(updateError);
      setError(updateError.message || 'Error al actualizar la solicitud');
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
            <h2 className="text-xl font-semibold text-white font-montserrat">Gestionar Solicitud PH</h2>
            <p className="text-sm text-[#99907c] mt-1">Conjunto: <span className="text-[#d0c5af]">{request.complex_name}</span></p>
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
              <span className="text-[10px] uppercase tracking-widest text-[#99907c] font-montserrat">Contacto</span>
              <span className="text-[#e4e1e7] text-sm">{request.administrator_name} ({request.role_title})</span>
              <span className="text-[#99907c] text-xs">{request.email} • {request.phone}</span>
            </div>
            <div className="flex flex-col pt-2 border-t border-[#262629]">
              <span className="text-[10px] uppercase tracking-widest text-[#99907c] font-montserrat">Mensaje Original</span>
              <span className="text-[#d0c5af] text-sm mt-1">{request.message || 'Sin mensaje adicional'}</span>
            </div>
          </div>

          <form id="edit-ph-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#d0c5af]">Estado de Solicitud <span className="text-[#ffb4ab]">*</span></label>
              <select required name="status" defaultValue={request.status} className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none">
                <option value="pendiente">Pendiente (Requiere visita técnica)</option>
                <option value="en_revision">En Revisión (Comité evaluando)</option>
                <option value="aprobada">Aprobada (Convenio firmado)</option>
                <option value="rechazada">Rechazada</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#d0c5af]">Notas Internas (Solo Administradores)</label>
              <textarea 
                name="admin_notes" 
                defaultValue={request.admin_notes || ''} 
                className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors min-h-[100px] resize-y" 
                placeholder="Ej. Visita técnica realizada el 15/03, salón cumple condiciones..."
              />
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
            form="edit-ph-form"
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
