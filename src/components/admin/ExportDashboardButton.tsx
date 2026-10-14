'use client';

import { Download } from 'lucide-react';

export function ExportDashboardButton() {
  const handleExport = () => {
    // In a real app this would generate a PDF or Excel
    window.print();
  };

  return (
    <button 
      onClick={handleExport}
      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#f2ca50] hover:brightness-110 text-[#0A0A0E] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider font-montserrat shadow-md shadow-[#D4AF37]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer w-full sm:w-auto"
    >
      <Download className="w-4 h-4 shrink-0" />
      <span>Exportar Informe</span>
    </button>
  );
}
