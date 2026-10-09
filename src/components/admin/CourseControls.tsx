'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Plus, ChevronDown } from 'lucide-react';
import { CourseCreateModal } from './CourseCreateModal';

interface Category {
  id: string;
  name: string;
}

interface CourseControlsProps {
  categories: Category[];
  currentQuery: string;
  currentCategory: string;
}

export function CourseControls({ categories, currentQuery, currentCategory }: CourseControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set('q', e.target.value);
    } else {
      params.delete('q');
    }
    router.push(`?${params.toString()}`);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set('category', e.target.value);
    } else {
      params.delete('category');
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex w-full sm:w-auto gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#99907c]" />
            <input 
              type="text" 
              placeholder="Buscar programa..." 
              defaultValue={currentQuery}
              onChange={handleSearch}
              className="w-full bg-[#0A0A0E]/80 border border-[#262629] text-[#e4e1e7] rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-colors placeholder:text-[#42454a]"
            />
          </div>
          
          <div className="relative">
            <select
              value={currentCategory}
              onChange={handleCategoryChange}
              className="appearance-none bg-[#0A0A0E]/80 border border-[#262629] text-[#d0c5af] px-6 py-3 pr-10 rounded-xl flex items-center gap-3 hover:text-white transition-colors focus:outline-none focus:border-[#D4AF37] cursor-pointer"
            >
              <option value="">Todas las categorías</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#99907c] pointer-events-none" />
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] px-6 py-3 rounded-xl font-montserrat font-semibold tracking-wider text-sm flex items-center justify-center gap-2 transition-colors uppercase"
        >
          <Plus className="w-4 h-4" />
          Nuevo Programa
        </button>
      </div>

      <CourseCreateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        categories={categories} 
      />
    </>
  );
}
