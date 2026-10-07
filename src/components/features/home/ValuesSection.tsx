import { Heart, Cross, Star, Globe, Users2, HandHeart, ShieldCheck } from "lucide-react";

export function ValuesSection() {
  const values = [
    { icon: <Heart />, name: "Amor" },
    { icon: <Cross />, name: "Fe" },
    { icon: <Star />, name: "Esperanza" },
    { icon: <HandHeart />, name: "Solidaridad" },
    { icon: <Globe />, name: "Inclusión" },
    { icon: <Users2 />, name: "Servicio" },
    { icon: <ShieldCheck />, name: "Compromiso Social" },
  ];

  return (
    <section className="py-24 bg-space-black relative z-10 border-t border-space-border/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wider mb-4">
            Valores que nos guían
          </h2>
          <div className="w-24 h-1 bg-gold-primary mx-auto rounded-full"></div>
        </div>

        <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
          {values.map((val, i) => (
            <div key={i} className="flex flex-col items-center gap-3 group">
              <div className="w-20 h-20 rounded-full border-2 border-gold-primary flex items-center justify-center text-gold-primary bg-space-dark group-hover:bg-gold-primary group-hover:text-space-dark transition-all duration-300 shadow-gold-glow">
                {val.icon}
              </div>
              <span className="text-white font-medium uppercase tracking-widest text-sm group-hover:text-gold-light transition-colors">
                {val.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
