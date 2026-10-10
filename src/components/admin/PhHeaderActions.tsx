'use client';

import { useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { PhCreateModal } from './PhCreateModal';

export function PhHeaderActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownloadExcel = async () => {
    const res = await fetch('/api/export/ph_requests');
    if (!res.ok) {
      alert('Error al generar el archivo');
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solicitudes_ph_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex gap-4">
        <button 
          onClick={handleDownloadExcel}
          className="flex items-center gap-2 bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-[#d0c5af] hover:text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors uppercase tracking-wider font-montserrat"
        >
          <Download className="w-4 h-4" />
          Descargar Excel
        </button>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors uppercase tracking-wider font-montserrat"
        >
          <Plus className="w-4 h-4" />
          Nueva Solicitud PH
        </button>
      </div>

      <PhCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
