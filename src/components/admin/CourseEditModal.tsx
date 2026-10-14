'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface CourseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string; name: string }[];
  course: any; // The course being edited
}

export function CourseEditModal({ isOpen, onClose, categories, course }: CourseEditModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || !course) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    const title = formData.get('title') as string;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const imageUrl = (formData.get('image_url') as string)?.trim() || null;

    const courseData = {
      title,
      slug,
      short_description: formData.get('short_description'),
      category_id: formData.get('category_id') || null,
      modality: formData.get('modality'),
      schedule_text: formData.get('schedule_text'),
      capacity: formData.get('capacity') ? parseInt(formData.get('capacity') as string) : null,
      status: formData.get('status'),
      image_url: imageUrl,
    };

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: updateError } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', course.id);

    if (updateError) {
      console.error(updateError);
      setError(updateError.message || 'Error al actualizar el programa');
      setLoading(false);
    } else {
      router.refresh(); 
      onClose();
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#0A0A0E]/80 backdrop-blur-sm">
      <div className="bg-[#17171a] border border-[#262629] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#262629] bg-[#1b1b1f] shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-white font-montserrat">Editar Programa Formativo</h2>
          <button onClick={onClose} className="text-[#99907c] hover:text-white transition-colors p-1">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
          {error && (
            <div className="bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form id="edit-course-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Título del programa <span className="text-[#ffb4ab]">*</span></label>
                <input required name="title" defaultValue={course.title} type="text" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none transition-colors text-sm" />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Categoría</label>
                <select name="category_id" defaultValue={course.category_id || ''} className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none text-sm">
                  <option value="">Ninguna</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Descripción breve</label>
                <input name="short_description" defaultValue={course.short_description || ''} type="text" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none transition-colors text-sm" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">URL de Imagen de Portada (img_url / image_url)</label>
                <input name="image_url" defaultValue={course.image_url || course.img_url || ''} type="text" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none transition-colors text-sm" placeholder="https://... o /images/taller-ejemplo.jpg" />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Modalidad <span className="text-[#ffb4ab]">*</span></label>
                <select required name="modality" defaultValue={course.modality || 'presencial'} className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none text-sm">
                  <option value="presencial">Presencial (Taller)</option>
                  <option value="virtual">Virtual (Curso)</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Horario</label>
                <input name="schedule_text" defaultValue={course.schedule_text || ''} type="text" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none transition-colors text-sm" />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Límite de Cupos (Vacío = Sin límite)</label>
                <input name="capacity" defaultValue={course.capacity || ''} type="number" min="1" className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none transition-colors text-sm" />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#d0c5af]">Estado <span className="text-[#ffb4ab]">*</span></label>
                <select required name="status" defaultValue={course.status || 'borrador'} className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none text-sm">
                  <option value="borrador">Borrador (No visible)</option>
                  <option value="publicado">Publicado (Activo)</option>
                  <option value="archivado">Archivado</option>
                </select>
              </div>
            </div>
            
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-[#262629] bg-[#1b1b1f] flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-[#d0c5af] hover:bg-[#262629] transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="edit-course-form"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
