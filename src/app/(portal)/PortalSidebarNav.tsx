'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  Award, 
  Building, 
  HeartHandshake, 
  HelpCircle,
  Settings 
} from 'lucide-react';

interface PortalSidebarNavProps {
  onLinkClick?: () => void;
}

export function PortalSidebarNav({ onLinkClick }: PortalSidebarNavProps) {
  const pathname = usePathname();

  const learningLinks = [
    { href: '/portal', label: 'Inicio / Resumen', icon: LayoutDashboard, exact: true },
    { href: '/portal/cursos', label: 'Mis Cursos Matriculados', icon: BookOpen },
    { href: '/portal/catalogo', label: 'Catálogo & Nuevas Inscripciones', icon: PlusCircle },
  ];

  const communityLinks = [
    { href: '/portal/solicitudes-ph', label: 'Solicitudes PH', icon: Building },
    { href: '/portal/donaciones', label: 'Donaciones y Aportes', icon: HeartHandshake },
    { href: '/portal/ayuda', label: 'Ayuda y Contacto', icon: HelpCircle },
    { href: '/portal/ajustes', label: 'Ajustes', icon: Settings },
  ];

  const isLinkActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const getLinkClasses = (isActive: boolean) => {
    return isActive
      ? "flex items-center gap-3 px-4 py-3 rounded-xl bg-[#D4AF37] text-[#0A0A0E] font-semibold text-sm transition-all shadow-md shadow-[#D4AF37]/20"
      : "flex items-center gap-3 px-4 py-3 rounded-xl text-[#d0c5af] hover:bg-[#1b1b1f] hover:text-[#D4AF37] font-medium text-sm transition-all";
  };

  return (
    <nav className="flex-1 px-4 space-y-6 overflow-y-auto custom-scrollbar py-2">
      {/* Grupo: Mi Aprendizaje & Formación */}
      <div className="space-y-1.5">
        <p className="px-3 text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#99907c] font-semibold mb-2">
          Mi Aprendizaje & Formación
        </p>
        {learningLinks.map((link) => {
          const Icon = link.icon;
          const active = isLinkActive(link.href, link.exact);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={getLinkClasses(active)}
              onClick={onLinkClick}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Grupo: Participación & Comunidad */}
      <div className="space-y-1.5">
        <p className="px-3 text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#99907c] font-semibold mb-2">
          Participación & Comunidad
        </p>
        {communityLinks.map((link) => {
          const Icon = link.icon;
          const active = isLinkActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={getLinkClasses(active)}
              onClick={onLinkClick}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
