'use client';

import { Search, RotateCcw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface DonationControlsProps {
  currentQuery: string;
  currentType: string;
  currentStatus: string;
}

export function DonationControls({ currentQuery, currentType, currentStatus }: DonationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set('q', e.target.value);
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('?');
  };

  return (
    <div className="space-y-4">
      {/* Barra superior de controles */}
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 bg-[#17171a] p-3 sm:p-4 rounded-xl border border-[#262629]">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#99907c]" />
          <input 
            type="text" 
            defaultValue={currentQuery}
            onChange={(e) => {
              const timer = setTimeout(() => handleSearch(e), 300);
              return () => clearTimeout(timer);
            }}
            placeholder="Buscar por donante, correo..." 
            className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg pl-11 pr-4 py-2.5 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full lg:w-auto">
          <select 
            value={currentType}
            onChange={(e) => handleFilter('type', e.target.value)}
            className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-[#d0c5af] focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none"
          >
            <option value="">Cualquier tipo de aporte</option>
            <option value="economico">Económico</option>
            <option value="insumos">Insumos</option>
            <option value="equipos">Equipos</option>
            <option value="patrocinio">Patrocinio</option>
          </select>
          
          <select 
            value={currentStatus}
            onChange={(e) => handleFilter('status', e.target.value)}
            className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-[#d0c5af] focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none"
          >
            <option value="">Todos los estados</option>
            <option value="nueva">Nueva</option>
            <option value="en_contacto">En Contacto</option>
            <option value="concretada">Concretada</option>
            <option value="descartada">Descartada</option>
          </select>
        </div>
      </div>

      {/* Chips de filtros activos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-[#99907c]">
          <span className="uppercase font-montserrat tracking-wider text-[10px]">Filtros Activos:</span>
          {(currentType || currentStatus || currentQuery) ? (
            <>
              {currentQuery && <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-[#1b1b1f] border border-[#D4AF37]/30 text-[#D4AF37] rounded-full text-[11px]">Búsqueda</span>}
              {currentType && <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-[#1b1b1f] border border-[#D4AF37]/30 text-[#D4AF37] rounded-full capitalize text-[11px]">Tipo: {currentType}</span>}
              {currentStatus && <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-[#1b1b1f] border border-[#D4AF37]/30 text-[#D4AF37] rounded-full capitalize text-[11px]">Estado: {currentStatus.replace('_', ' ')}</span>}
            </>
          ) : (
            <span className="px-2.5 py-0.5 bg-[#1b1b1f] border border-[#262629] text-[#42454a] rounded-full text-[11px]">Ninguno</span>
          )}
        </div>
        
        <button 
          onClick={clearFilters}
          className="flex items-center gap-1.5 text-[#D4AF37] hover:text-[#F5D77A] font-medium transition-colors text-xs self-start sm:self-auto"
        >
          <RotateCcw className="w-3 h-3" />
          Restablecer Filtros
        </button>
      </div>
    </div>
  );
}
