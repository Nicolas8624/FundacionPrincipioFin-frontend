import Link from "next/link";
import { Building2 } from "lucide-react";
import { FOUNDATION } from "@/constants/foundation";

export function HorizontalPropertySection() {
  return (
    <section className="py-24 bg-space-dark relative z-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-space-card to-space-black border border-gold-primary/30 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 text-space-border opacity-20 pointer-events-none">
            <Building2 className="w-64 h-64" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="w-20 h-20 shrink-0 bg-gold-primary/10 rounded-full flex items-center justify-center border border-gold-primary/50">
              <Building2 className="w-10 h-10 text-gold-primary" />
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 uppercase">
                ¿Administras un conjunto residencial?
              </h2>
              <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                Activa tus salones comunales con programas gratuitos y de bajo costo. 
                Fomenta la integración, el aprovechamiento positivo de espacios y el desarrollo del tejido social.
              </p>
              <Link
                href={FOUNDATION.routes.horizontalProperty}
                className="inline-block px-8 py-3 bg-gold-primary text-space-dark font-bold rounded-lg hover:bg-gold-light hover:shadow-gold-glow transition-all uppercase tracking-wider text-sm"
              >
                Conocer Propuesta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
