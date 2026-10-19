'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Eye, Trash2, Download } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { PhEditModal } from './PhEditModal';
import { PhDetailModal } from './PhDetailModal';
import { extractActaInfo } from '@/lib/ph-utils';

interface PhActionsProps {
  request: any;
}

export function PhActions({ request }: PhActionsProps) {
  const router = useRouter();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la solicitud PH del conjunto "${request.complex_name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    setIsDeleting(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.from('ph_requests').delete().eq('id', request.id);

    if (error) {
      console.error(error);
      alert('Error al eliminar la solicitud.');
    } else {
      router.refresh();
    }
    setIsDeleting(false);
  };

  const actaInfo = extractActaInfo(request.admin_notes);

  return (
    <>
      <div className="flex justify-end gap-2">
        {actaInfo?.fileUrl && (
          <a 
            href={actaInfo.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all"
            title={`Descargar Acta Adjunta (${actaInfo.fileName})`}
          >
            <Download className="w-4 h-4" />
          </a>
        )}
        <button 
          onClick={() => setIsDetailModalOpen(true)}
          className="w-9 h-9 rounded-full bg-[#1b1b1f] border border-[#262629] text-[#e4e1e7] flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#0A0A0E] hover:border-[#D4AF37] transition-all"
          title="Ver detalles completos"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="w-9 h-9 rounded-full bg-[#1b1b1f] border border-[#262629] text-[#d0c5af] flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#0A0A0E] hover:border-[#D4AF37] transition-all" 
          title="Gestionar estado"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-9 h-9 rounded-full bg-[#1b1b1f] border border-[#262629] text-[#93000a] flex items-center justify-center hover:bg-[#93000a] hover:text-[#ffb4ab] hover:border-[#93000a] transition-all disabled:opacity-50" 
          title="Eliminar registro"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <PhDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={() => {
          setIsDetailModalOpen(false);
          setIsEditModalOpen(true);
        }}
        request={request}
      />

      <PhEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        request={request}
      />
    </>
  );
}
