import { Target, Telescope } from "lucide-react";

export function MissionVision() {
  return (
    <section className="py-20 bg-space-black relative z-10 border-t border-space-border/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Misión */}
          <div className="bg-space-card border border-gold-primary/30 rounded-2xl p-8 hover:border-gold-primary transition-colors flex flex-col items-center text-center group shadow-lg">
            <div className="w-16 h-16 bg-gold-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-gold-primary group-hover:scale-110 transition-all">
              <Target className="w-8 h-8 text-gold-primary group-hover:text-space-dark" />
            </div>
            <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-4">Nuestra Misión</h3>
            <p className="text-gray-300 leading-relaxed">
              Brindar herramientas formativas, artísticas y de emprendimiento a comunidades vulnerables 
              de Bogotá, fomentando el desarrollo integral de las familias mediante la metodología de "Aprender haciendo", 
              para promover la autonomía económica y la integración comunitaria.
            </p>
          </div>

          {/* Visión */}
          <div className="bg-space-card border border-gold-primary/30 rounded-2xl p-8 hover:border-gold-primary transition-colors flex flex-col items-center text-center group shadow-lg">
            <div className="w-16 h-16 bg-gold-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-gold-primary group-hover:scale-110 transition-all">
              <Telescope className="w-8 h-8 text-gold-primary group-hover:text-space-dark" />
            </div>
            <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-4">Nuestra Visión</h3>
            <p className="text-gray-300 leading-relaxed">
              Ser reconocidos como una fundación líder en la transformación social del sur de Bogotá, 
              destacando por nuestra capacidad para conectar talentos, restaurar la esperanza y construir 
              un futuro equitativo donde cada individuo pueda prosperar y volver a comenzar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
