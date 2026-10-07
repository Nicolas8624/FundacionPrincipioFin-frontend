import { BookOpen, Palette, Smile, HeartPulse, Lightbulb, Leaf } from "lucide-react";

export function ActionLines() {
  const lines = [
    { icon: <BookOpen />, title: "Educación y Familia" },
    { icon: <Palette />, title: "Arte y Cultura" },
    { icon: <Smile />, title: "Recreación y Experiencias" },
    { icon: <HeartPulse />, title: "Bienestar y Desarrollo" },
    { icon: <Lightbulb />, title: "Emprendimiento" },
    { icon: <Leaf />, title: "Medio Ambiente" }
  ];

  return (
    <section className="py-20 relative z-10 border-t border-space-border/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wider mb-4">
            Líneas de Acción
          </h2>
          <div className="w-24 h-1 bg-gold-primary mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
          {lines.map((line, i) => (
            <div key={i} className="flex flex-col items-center text-center group bg-space-card/40 p-6 rounded-xl border border-space-border hover:border-gold-primary/50 transition-colors">
              <div className="text-gold-primary w-12 h-12 mb-4 group-hover:scale-110 transition-transform flex items-center justify-center">
                {line.icon}
              </div>
              <h3 className="text-white font-medium text-sm md:text-base uppercase tracking-wider">
                {line.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
