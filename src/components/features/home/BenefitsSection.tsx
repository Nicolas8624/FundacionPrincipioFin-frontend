import { Brain, Award, Users, Lightbulb, UserCheck } from "lucide-react";

export function BenefitsSection() {
  const benefits = [
    { icon: <Brain />, title: "Desarrollo de habilidades" },
    { icon: <Award />, title: "Formación certificada", subtitle: `"Aprender haciendo"` },
    { icon: <Users />, title: "Integración comunitaria" },
    { icon: <Lightbulb />, title: "Emprendimiento local" },
    { icon: <UserCheck />, title: "Oportunidades para todas las edades" }
  ];

  return (
    <section className="py-24 bg-space-dark relative z-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wider mb-4">
            ¿Por qué participar en la fundación?
          </h2>
          <p className="text-gold-primary font-medium tracking-widest uppercase">
            Beneficios
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 bg-space-card/50 border border-space-border rounded-xl hover:border-gold-primary/50 transition-colors">
              <div className="text-gold-primary w-12 h-12 mb-4 flex items-center justify-center">
                {benefit.icon}
              </div>
              <h3 className="text-white font-semibold text-lg">{benefit.title}</h3>
              {benefit.subtitle && (
                <span className="text-sm text-gold-light mt-2 italic">{benefit.subtitle}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
