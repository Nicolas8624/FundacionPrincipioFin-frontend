import Link from "next/link";
import { Palette, Scissors, Wrench } from "lucide-react";
import { FOUNDATION } from "@/constants/foundation";

export function ImpactLinesSection() {
  const axes = [
    {
      title: "Arte y Cultura",
      description: "Pintura en cerámica, óleo, decoupage y manualidades.",
      icon: <Palette className="w-10 h-10 text-gold-primary" />,
      color: "border-t-green-500"
    },
    {
      title: "Belleza y Emprendimiento",
      description: "Diseño de cejas, lifting de pestañas, trenzas kanekalon.",
      icon: <Scissors className="w-10 h-10 text-gold-primary" />,
      color: "border-t-pink-500"
    },
    {
      title: "Educación y Oficios",
      description: "Música, formulación de proyectos, electricidad y mecánica.",
      icon: <Wrench className="w-10 h-10 text-gold-primary" />,
      color: "border-t-blue-500"
    }
  ];

  return (
    <section className="py-20 relative z-10 border-t border-space-border/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wider mb-4">
            Líneas de Impacto
          </h2>
          <p className="text-gold-primary font-medium tracking-widest uppercase">
            Programas y Servicios
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {axes.map((axis, i) => (
            <div key={i} className={`bg-space-card rounded-xl p-8 border border-space-border ${axis.color} border-t-4 hover:shadow-gold-glow transition-all hover:-translate-y-2 group flex flex-col h-full`}>
              <div className="mb-6 bg-space-black w-20 h-20 rounded-full flex items-center justify-center border border-space-border group-hover:border-gold-primary transition-colors">
                {axis.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 uppercase">{axis.title}</h3>
              <p className="text-gray-400 leading-relaxed mb-8 flex-grow">{axis.description}</p>
              <Link
                href={FOUNDATION.routes.programs}
                className="inline-flex items-center text-gold-primary font-semibold hover:text-white transition-colors uppercase tracking-wider text-sm mt-auto"
              >
                Ver Cursos &rarr;
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
