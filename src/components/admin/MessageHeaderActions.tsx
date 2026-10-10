'use client';

import { Download } from 'lucide-react';

export function MessageHeaderActions() {

  const handleDownloadExcel = async () => {
    const res = await fetch('/api/export/messages');
    if (!res.ok) {
      alert('Error al generar el archivo');
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mensajes_contacto_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-4">
      <button 
        onClick={handleDownloadExcel}
        className="flex items-center gap-2 bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-[#d0c5af] hover:text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors uppercase tracking-wider font-montserrat"
      >
        <Download className="w-4 h-4" />
        Descargar Excel
      </button>
    </div>
  );
}
