"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Users, Building, HeartHandshake, MessageSquare, Settings, Images } from 'lucide-react';

export function SidebarNav() {
  const pathname = usePathname();

  const links = [
    { href: '/admin/dashboard', label: 'Resumen', icon: LayoutDashboard },
    { href: '/admin/cursos', label: 'Cursos', icon: BookOpen },
    { href: '/admin/inscripciones', label: 'Inscripciones', icon: Users },
    { href: '/admin/solicitudes-ph', label: 'Solicitudes PH', icon: Building },
    { href: '/admin/donaciones', label: 'Donaciones y alianzas', icon: HeartHandshake },
    { href: '/admin/mensajes', label: 'Mensajes de contacto', icon: MessageSquare },
    { href: '/admin/galeria', label: 'Galería Multimedia', icon: Images },
  ];

  const settingsLink = { href: '/admin/configuracion', label: 'Ajustes del Sistema', icon: Settings };

  const getLinkClasses = (href: string) => {
    // Si la ruta exacta coincide o estamos dentro de subrutas
    const isActive = pathname === href || pathname.startsWith(`${href}/`);
    return isActive
      ? "flex items-center gap-3 px-4 py-3 rounded-lg bg-[#D4AF37] text-[#0A0A0E] font-medium text-sm transition-colors"
      : "flex items-center gap-3 px-4 py-3 rounded-lg text-[#d0c5af] hover:bg-[#1b1b1f] hover:text-[#D4AF37] font-medium text-sm transition-colors";
  };

  return (
    <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link key={link.href} href={link.href} className={getLinkClasses(link.href)}>
            <Icon className="w-5 h-5" />
            {link.label}
          </Link>
        );
      })}
      
      <div className="pt-6 pb-2 px-2">
        <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#99907c] mb-2">Ajustes</p>
      </div>
      
      <Link href={settingsLink.href} className={getLinkClasses(settingsLink.href)}>
        <settingsLink.icon className="w-5 h-5" />
        {settingsLink.label}
      </Link>
    </nav>
  );
}
