import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, Infinity as InfinityIcon } from "lucide-react";
import { FOUNDATION } from "@/constants/foundation";

export function Footer() {
  return (
    <footer className="bg-space-card border-t border-space-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href={FOUNDATION.routes.home} className="flex items-center gap-2">
              <InfinityIcon className="h-8 w-8 text-gold-primary" />
              <span className="text-xl font-bold uppercase text-white">
                Principio <span className="text-gold-primary">&</span> Fin
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mt-2">
              {FOUNDATION.slogans[1]}
            </p>
            <div className="flex items-center gap-4 mt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="h-10 w-10 flex items-center justify-center rounded-full bg-space-border text-gray-300 hover:text-gold-primary hover:bg-space-black transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="h-10 w-10 flex items-center justify-center rounded-full bg-space-border text-gray-300 hover:text-gold-primary hover:bg-space-black transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Explorar</h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href={FOUNDATION.routes.about} className="text-gray-400 hover:text-gold-primary transition-colors text-sm">
                  Quiénes Somos
                </Link>
              </li>
              <li>
                <Link href={FOUNDATION.routes.programs} className="text-gray-400 hover:text-gold-primary transition-colors text-sm">
                  Programas y Cursos
                </Link>
              </li>
              <li>
                <Link href={FOUNDATION.routes.horizontalProperty} className="text-gray-400 hover:text-gold-primary transition-colors text-sm">
                  Propiedad Horizontal
                </Link>
              </li>
              <li>
                <Link href={FOUNDATION.routes.donations} className="text-gray-400 hover:text-gold-primary transition-colors text-sm">
                  Donaciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Contacto</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="h-5 w-5 text-gold-primary shrink-0" />
                <span>{FOUNDATION.contact.address}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="h-5 w-5 text-gold-primary shrink-0" />
                <span>{FOUNDATION.contact.phone}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="h-5 w-5 text-gold-primary shrink-0" />
                <span>{FOUNDATION.contact.email}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Boletín</h3>
            <p className="text-sm text-gray-400 mb-4">
              Únete para recibir noticias sobre nuestros programas y eventos.
            </p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="bg-space-black border border-space-border rounded-md px-4 py-2 text-sm text-white focus:outline-none focus:border-gold-primary transition-colors"
                required
              />
              <button
                type="submit"
                className="bg-space-border text-white hover:text-space-dark hover:bg-gold-primary transition-colors rounded-md px-4 py-2 text-sm font-medium"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-space-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} {FOUNDATION.name}. Todos los derechos reservados.</p>
          <p className="tracking-widest uppercase text-gold-primary/70">{FOUNDATION.slogans[2]}</p>
        </div>
      </div>
    </footer>
  );
}
