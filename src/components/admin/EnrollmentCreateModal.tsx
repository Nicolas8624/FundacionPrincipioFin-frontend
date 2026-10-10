'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface EnrollmentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: { id: string; title: string }[];
}

export function EnrollmentCreateModal({ isOpen, onClose, courses }: EnrollmentCreateModalProps) {
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
    
    const enrollmentData = {
      course_id: formData.get('course_id'),
      full_name: formData.get('full_name'),
      document_type: formData.get('document_type'),
      document_number: formData.get('document_number'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      status: formData.get('status'),
      admin_notes: formData.get('admin_notes'),
      accepted_data_policy: true, // as it's an admin bypass
    };

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: insertError } = await supabase
      .from('course_enrollments')
      .insert([enrollmentData]);

    if (insertError) {
      console.error(insertError);
      setError(insertError.message || 'Error al crear la inscripción');
      setLoading(false);
    } else {
      router.refresh(); 
      onClose();
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A0A0E]/80 backdrop-blur-sm">
      <div className="bg-[#17171a] border border-[#262629] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#262629] bg-[#1b1b1f]">
          <div>
            <h2 className="text-xl font-semibold text-white font-montserrat">Inscribir Manualmente</h2>
            <p className="text-sm text-[#99907c] mt-1">Registra a un estudiante que no tiene acceso a la plataforma</p>
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

          <form id="create-enrollment-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-[#d0c5af]">Taller a inscribirse <span className="text-[#ffb4ab]">*</span></label>
                <select required name="course_id" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none">
                  <option value="">Selecciona un curso o taller</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-[#d0c5af]">Nombre Completo <span className="text-[#ffb4ab]">*</span></label>
                <input required type="text" name="full_name" placeholder="Nombres y apellidos" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#d0c5af]">Tipo de Documento <span className="text-[#ffb4ab]">*</span></label>
                <select required name="document_type" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none">
                  <option value="CC">Cédula de Ciudadanía (CC)</option>
                  <option value="TI">Tarjeta de Identidad (TI)</option>
                  <option value="CE">Cédula de Extranjería (CE)</option>
                  <option value="PA">Pasaporte (PA)</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#d0c5af]">Número de Documento <span className="text-[#ffb4ab]">*</span></label>
                <input required type="text" name="document_number" placeholder="Ej. 1020304050" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#d0c5af]">Correo Electrónico</label>
                <input type="email" name="email" placeholder="Opcional" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#d0c5af]">Teléfono / Celular <span className="text-[#ffb4ab]">*</span></label>
                <input required type="text" name="phone" placeholder="Ej. 3001234567" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-[#d0c5af]">Estado Inicial <span className="text-[#ffb4ab]">*</span></label>
                <select required name="status" defaultValue="confirmada" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none">
                  <option value="confirmada">Confirmada / Aprobada Oficial</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="lista_espera">Lista de Espera</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-[#d0c5af]">Notas Internas del Administrador</label>
                <textarea 
                  name="admin_notes" 
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors min-h-[80px] resize-y" 
                  placeholder="Inscrito manualmente por el administrador en recepción."
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
            form="create-enrollment-form"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Guardando...' : <><CheckCircle2 className="w-4 h-4" /> Registrar Inscripción</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
