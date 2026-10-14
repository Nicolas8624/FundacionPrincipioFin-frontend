'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { SidebarNav } from './SidebarNav';
import { signout } from './actions';
import { StarfieldBackground } from '@/components/ui/StarfieldBackground';
import { EarthBackground } from '@/components/ui/EarthBackground';

interface AdminLayoutClientProps {
  userFullName: string;
  userEmail: string;
  children: React.ReactNode;
}

export function AdminLayoutClient({
  userFullName,
  userEmail,
  children
}: AdminLayoutClientProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Bloquear scroll del fondo en móviles cuando el drawer está abierto
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const userInitial = (userFullName[0] || userEmail[0] || 'A').toUpperCase();

  return (
    <div className="h-screen bg-[#0A0A0E] flex flex-col lg:flex-row text-[#e4e1e7] font-inter overflow-hidden relative">
      <StarfieldBackground />
      <EarthBackground />

      {/* Backdrop overlay para pantallas móviles y tablets (< lg) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Admin (Fijo en desktop, cajón deslizable en móvil) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 lg:static lg:z-10
          w-[280px] xl:w-[290px] bg-[#0A0A0E] flex flex-col flex-shrink-0
          border-r border-[#262629] h-full
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0 shadow-2xl shadow-black/80' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Cabecera del Sidebar con Logo y botón cerrar en móvil */}
        <div className="p-6 pb-4 lg:p-8 lg:pb-6 flex items-center justify-between flex-shrink-0">
          <img
            src="/images/logo-admin.png"
            alt="Fundación Principio & Fin"
            className="h-9 lg:h-10 object-contain"
          />
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 rounded-xl bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-[#99907c] hover:text-white transition-colors cursor-pointer"
            aria-label="Cerrar menú de navegación"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-2 flex-shrink-0">
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#99907c] mb-3">
            Administración
          </p>
        </div>

        {/* Navegación con cierre automático en móvil */}
        <SidebarNav onLinkClick={() => setIsMobileOpen(false)} />

        {/* Perfil del Administrador y Cerrar Sesión */}
        <div className="p-4 sm:p-6 pb-8 lg:pb-10 mt-auto border-t border-[#262629] flex-shrink-0 bg-[#0A0A0E]">
          <div className="bg-[#1b1b1f] rounded-xl p-3 flex items-center gap-3 border border-[#262629] shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#D4AF37] to-[#ffe082] flex items-center justify-center text-[#0A0A0E] font-bold font-montserrat text-lg flex-shrink-0 shadow-sm">
              {userInitial}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#e4e1e7] truncate" title={userFullName}>
                {userFullName}
              </p>
              <p className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] truncate" title={userEmail}>
                {userEmail}
              </p>
            </div>
            <form action={signout} className="flex-shrink-0">
              <button
                type="submit"
                title="Cerrar sesión"
                className="p-2 rounded-lg bg-transparent hover:bg-rose-500/15 text-[#ffb4ab] hover:text-rose-300 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Contenedor Principal (Barra superior móvil + Contenido scrolleable) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-20 min-w-0">
        {/* Barra Superior Móvil (< lg) */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#0A0A0E]/90 backdrop-blur-md border-b border-[#262629] px-4 py-3 flex items-center justify-between shadow-lg flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-xl bg-[#131317] border border-[#262629] hover:border-[#D4AF37]/50 text-[#D4AF37] hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img
                src="/images/logo-admin.png"
                alt="Fundación Principio & Fin"
                className="h-7 w-auto object-contain"
              />
            </div>
          </div>

          {/* Avatar del usuario en cabecera móvil */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 pl-2.5 pr-1 py-1 rounded-full bg-[#1b1b1f] border border-[#262629]">
              <span className="text-xs font-medium text-[#e4e1e7] max-w-[120px] truncate hidden sm:inline">
                {userFullName}
              </span>
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#ffe082] text-[#0A0A0E] font-bold font-montserrat text-[10px] flex items-center justify-center shadow-sm">
                {userInitial}
              </div>
            </div>
          </div>
        </header>

        {/* Área de contenido con scroll independiente y padding responsivo */}
        <main className="flex-1 overflow-y-auto bg-transparent focus:outline-none">
          <div className="p-4 sm:p-6 md:p-8 lg:p-10 w-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
