import { Users, Zap, Briefcase, Shield, HeartHandshake, Network } from "lucide-react";

export function PhBenefits() {
  const benefits = [
    { icon: <Users />, text: "Integración intergeneracional" },
    { icon: <Zap />, text: "Activación permanente del salón comunal" },
    { icon: <Briefcase />, text: "Formación para el trabajo y emprendimiento" },
    { icon: <Shield />, text: "Espacios seguros para niños y jóvenes" },
    { icon: <HeartHandshake />, text: "Programas especializados para adultos mayores" },
    { icon: <Network />, text: "Fortalecimiento del tejido social" },
  ];

  return (
    <section className="py-20 bg-space-black relative z-10 border-t border-space-border/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white uppercase tracking-wider mb-4">
            Beneficios para la Copropiedad
          </h2>
          <div className="w-24 h-1 bg-gold-primary mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex items-start gap-4 bg-space-card/50 p-6 rounded-xl border border-space-border hover:border-gold-primary/50 transition-colors">
              <div className="text-gold-primary shrink-0 p-2 bg-space-black rounded-lg border border-space-border">
                {benefit.icon}
              </div>
              <p className="text-gray-300 font-medium pt-2">{benefit.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
