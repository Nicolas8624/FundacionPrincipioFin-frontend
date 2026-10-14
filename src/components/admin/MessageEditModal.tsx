'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface MessageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
}

export function MessageEditModal({ isOpen, onClose, request }: MessageEditModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Si el mensaje es "nuevo", lo pasamos a "leido" automáticamente al abrir el modal.
    if (isOpen && request && request.status === 'nuevo') {
      const updateToRead = async () => {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabase
          .from('contact_messages')
          .update({ status: 'leido' })
          .eq('id', request.id);
        router.refresh();
      };
      updateToRead();
    }
  }, [isOpen, request, router]);

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
      .from('contact_messages')
      .update(requestData)
      .eq('id', request.id);

    if (updateError) {
      console.error(updateError);
      setError(updateError.message || 'Error al actualizar el mensaje');
      setLoading(false);
    } else {
      router.refresh(); 
      onClose();
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-[#0A0A0E]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#17171a] border border-[#262629] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#262629] bg-[#1b1b1f]">
          <div className="pr-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white font-montserrat">Gestionar Mensaje</h2>
            <p className="text-xs sm:text-sm text-[#99907c] mt-1 truncate">De: <span className="text-[#d0c5af]">{request.name}</span></p>
          </div>
          <button onClick={onClose} className="text-[#99907c] hover:text-white transition-colors p-1 rounded-lg hover:bg-[#262629] shrink-0">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
          {error && (
            <div className="bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="mb-6 bg-[#1b1b1f] border border-[#262629] rounded-xl p-3.5 sm:p-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 border-b border-[#262629] pb-3 sm:pb-4">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-widest text-[#99907c] font-montserrat">Contacto</span>
                <span className="text-[#e4e1e7] text-xs sm:text-sm mt-1 break-all">{request.email}</span>
                <span className="text-[#99907c] text-xs">{request.phone || 'Sin teléfono'}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-widest text-[#99907c] font-montserrat">Asunto</span>
                <span className="text-[#D4AF37] text-xs sm:text-sm mt-1 break-words">{request.subject}</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-[#99907c] font-montserrat">Mensaje Original</span>
              <p className="text-[#e4e1e7] text-xs sm:text-sm mt-2 whitespace-pre-wrap leading-relaxed break-words">{request.message}</p>
            </div>
          </div>

          <form id="edit-message-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Estado del Ticket <span className="text-[#ffb4ab]">*</span></label>
              <select required name="status" defaultValue={request.status === 'nuevo' ? 'leido' : request.status} className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none cursor-pointer">
                <option value="leido">Leído (Pendiente de respuesta)</option>
                <option value="respondido">Respondido / Gestionado</option>
                <option value="archivado">Archivado</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Notas Internas sobre la respuesta</label>
              <textarea 
                name="admin_notes" 
                defaultValue={request.admin_notes || ''} 
                className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors min-h-[100px] resize-y" 
                placeholder="Ej. Se le envió un correo respondiendo su duda el 10/05..."
              />
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 sm:py-4 border-t border-[#262629] bg-[#1b1b1f] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4">
          <button 
            type="button" 
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-[#d0c5af] hover:bg-[#262629] transition-colors text-center"
          >
            Cerrar
          </button>
          <button 
            type="submit" 
            form="edit-message-form"
            disabled={loading}
            className="w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? 'Guardando...' : <><CheckCircle2 className="w-4 h-4" /> Guardar Cambios</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
