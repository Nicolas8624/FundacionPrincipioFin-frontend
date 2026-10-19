'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Eye, Trash2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { DonationEditModal } from './DonationEditModal';
import { DonationDetailModal } from './DonationDetailModal';

interface DonationActionsProps {
  request: any;
}

export function DonationActions({ request }: DonationActionsProps) {
  const router = useRouter();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la donación de "${request.donor_name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    setIsDeleting(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.from('donation_requests').delete().eq('id', request.id);

    if (error) {
      console.error(error);
      alert('Error al eliminar la donación.');
    } else {
      router.refresh();
    }
    setIsDeleting(false);
  };

  return (
    <>
      <div className="flex justify-end gap-2">
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

      <DonationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={() => {
          setIsDetailModalOpen(false);
          setIsEditModalOpen(true);
        }}
        request={request}
      />

      <DonationEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        request={request}
      />
    </>
  );
}
