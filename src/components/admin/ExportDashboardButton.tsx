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
      className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#e1c469] text-[#0A0A0E] px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors uppercase tracking-wider font-montserrat"
    >
      <Download className="w-4 h-4" />
      Exportar Informe
    </button>
  );
}
