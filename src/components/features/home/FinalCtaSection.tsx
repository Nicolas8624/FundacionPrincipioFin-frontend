import Link from "next/link";
import { FOUNDATION } from "@/constants/foundation";

export function FinalCtaSection() {
  return (
    <section className="py-32 bg-space-black relative z-10 border-t border-space-border text-center px-4">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-8">
          Tu apoyo hace posible <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-primary to-gold-light">
            volver a comenzar
          </span>
        </h2>
        <p className="text-xl text-gray-300 mb-10 leading-relaxed">
          Cada aporte representa una oportunidad de transformación para una familia y una comunidad. Únete a nuestra misión.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={FOUNDATION.routes.donations}
            className="px-10 py-4 bg-gold-primary text-space-dark font-bold rounded-lg shadow-gold-glow hover:bg-gold-light hover:-translate-y-1 transition-all text-lg uppercase tracking-wider"
          >
            Hacer una donación
          </Link>
          <Link
            href={FOUNDATION.routes.contact}
            className="px-10 py-4 bg-transparent border-2 border-space-border text-white font-bold rounded-lg hover:border-gold-primary hover:text-gold-primary hover:-translate-y-1 transition-all text-lg uppercase tracking-wider"
          >
            Ser Patrocinador
          </Link>
        </div>
      </div>
    </section>
  );
}
