'use client';

import { Search, RotateCcw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Course {
  id: string;
  title: string;
}

interface EnrollmentControlsProps {
  courses: Course[];
  currentQuery: string;
  currentCourse: string;
  currentStatus: string;
  currentModality: string;
}

export function EnrollmentControls({ courses, currentQuery, currentCourse, currentStatus, currentModality }: EnrollmentControlsProps) {
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
      <div className="flex flex-col md:flex-row gap-4 bg-[#17171a] p-4 rounded-xl border border-[#262629]">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#99907c]" />
          <input 
            type="text" 
            defaultValue={currentQuery}
            onChange={(e) => {
              // Debounce para no saturar con requests
              const timer = setTimeout(() => handleSearch(e), 300);
              return () => clearTimeout(timer);
            }}
            placeholder="Buscar por nombre, cédula..." 
            className="w-full bg-[#0A0A0E] border border-[#262629] rounded-lg pl-11 pr-4 py-2.5 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
          />
        </div>
        
        <div className="flex gap-4">
          <select 
            value={currentCourse}
            onChange={(e) => handleFilter('course', e.target.value)}
            className="bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-2.5 text-sm text-[#d0c5af] focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none min-w-[200px]"
          >
            <option value="">Todos los cursos</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          
          <select 
            value={currentStatus}
            onChange={(e) => handleFilter('status', e.target.value)}
            className="bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-2.5 text-sm text-[#d0c5af] focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none min-w-[180px]"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Aprobada (Confirmada)</option>
            <option value="lista_espera">Lista de Espera</option>
            <option value="rechazada">Rechazada</option>
            <option value="cancelada">Cancelada</option>
            <option value="completada">Completada</option>
          </select>

          <select 
            value={currentModality}
            onChange={(e) => handleFilter('modality', e.target.value)}
            className="bg-[#0A0A0E] border border-[#262629] rounded-lg px-4 py-2.5 text-sm text-[#d0c5af] focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none min-w-[180px]"
          >
            <option value="">Todas las modalidades</option>
            <option value="virtual">Virtual</option>
            <option value="presencial">Presencial</option>
            <option value="hibrido">Híbrida</option>
          </select>
        </div>
      </div>

      {/* Chips de filtros activos (Visual) */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-[#99907c]">
          <span className="uppercase font-montserrat tracking-wider text-[10px]">Filtros Activos:</span>
          {(currentCourse || currentStatus || currentModality || currentQuery) ? (
            <>
              {currentQuery && <span className="px-3 py-1 bg-[#1b1b1f] border border-[#D4AF37]/30 text-[#D4AF37] rounded-full">Búsqueda: {currentQuery}</span>}
              {currentCourse && <span className="px-3 py-1 bg-[#1b1b1f] border border-[#D4AF37]/30 text-[#D4AF37] rounded-full">Curso Filtrado</span>}
              {currentStatus && <span className="px-3 py-1 bg-[#1b1b1f] border border-[#D4AF37]/30 text-[#D4AF37] rounded-full capitalize">Estado: {currentStatus}</span>}
              {currentModality && <span className="px-3 py-1 bg-[#1b1b1f] border border-[#D4AF37]/30 text-[#D4AF37] rounded-full capitalize">Modalidad: {currentModality}</span>}
            </>
          ) : (
            <span className="px-3 py-1 bg-[#1b1b1f] border border-[#262629] text-[#42454a] rounded-full">Ninguno</span>
          )}
        </div>
        
        <button 
          onClick={clearFilters}
          className="flex items-center gap-2 text-[#D4AF37] hover:text-[#F5D77A] font-medium transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Restablecer Filtros
        </button>
      </div>
    </div>
  );
}
