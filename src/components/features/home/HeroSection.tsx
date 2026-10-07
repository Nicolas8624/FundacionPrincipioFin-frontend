import Link from "next/link";
import { FOUNDATION } from "@/constants/foundation";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight uppercase max-w-4xl leading-tight mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold-primary to-gold-light animate-pulse">
            Podemos sanar
          </span>{" "}
          y volver a comenzar
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed">
          Conectamos talentos, transformamos futuros a través del arte, la educación, la cultura y el emprendimiento.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto">
          <Link
            href={FOUNDATION.routes.programs}
            className="px-8 py-4 bg-gold-primary text-space-dark font-bold rounded-lg shadow-gold-glow hover:bg-gold-light hover:-translate-y-1 transition-all text-lg"
          >
            Ver Programas
          </Link>
          <Link
            href={FOUNDATION.routes.donations}
            className="px-8 py-4 bg-transparent border-2 border-gold-primary text-gold-primary font-bold rounded-lg hover:bg-gold-primary/10 hover:-translate-y-1 transition-all text-lg"
          >
            Quiero Donar
          </Link>
        </div>

        <div className="w-full max-w-5xl bg-space-card/80 backdrop-blur-md border border-space-border rounded-2xl p-8 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white mb-2">1000+</span>
              <span className="text-sm text-gold-primary uppercase tracking-wider text-center font-semibold">Personas Formadas</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white mb-2">10+</span>
              <span className="text-sm text-gold-primary uppercase tracking-wider text-center font-semibold">Talleres Activos</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white mb-2">15+</span>
              <span className="text-sm text-gold-primary uppercase tracking-wider text-center font-semibold">Aliados Estratégicos</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white mb-2">03</span>
              <span className="text-sm text-gold-primary uppercase tracking-wider text-center font-semibold">Localidades en Bogotá</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
