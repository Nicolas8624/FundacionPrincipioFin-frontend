"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Infinity as InfinityIcon } from "lucide-react";
import { FOUNDATION } from "@/constants/foundation";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Inicio", path: FOUNDATION.routes.home },
    { name: "Quiénes Somos", path: FOUNDATION.routes.about },
    { name: "Programas", path: FOUNDATION.routes.programs },
    { name: "Propiedad Horizontal", path: FOUNDATION.routes.horizontalProperty },
    { name: "Contacto", path: FOUNDATION.routes.contact },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-space-border bg-space-black/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href={FOUNDATION.routes.home} className="flex items-center gap-2 group">
          <InfinityIcon className="h-8 w-8 text-gold-primary transition-transform group-hover:scale-110" />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white uppercase leading-none">
              Principio <span className="text-gold-primary">&</span> Fin
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
              Fundación
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions Desktop */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Ingresar
          </Link>
          <Link
            href={FOUNDATION.routes.donations}
            className="text-sm font-semibold bg-gold-primary text-space-dark px-5 py-2.5 rounded-md hover:bg-gold-light transition-colors shadow-gold-glow"
          >
            Donar
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-gray-300 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Alternar menú"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-space-card border-b border-space-border shadow-xl">
          <nav className="flex flex-col p-4 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="text-base font-medium text-gray-300 hover:text-white transition-colors p-2 rounded-md hover:bg-space-border/50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="h-px bg-space-border my-2" />
            <Link
              href="/login"
              className="text-base font-medium text-gray-300 hover:text-white p-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Ingresar
            </Link>
            <Link
              href={FOUNDATION.routes.donations}
              className="text-base font-semibold bg-gold-primary text-space-dark text-center px-4 py-3 rounded-md hover:bg-gold-light transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Donar
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
