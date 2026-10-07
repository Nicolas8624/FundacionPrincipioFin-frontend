import { Wallet, Package, Laptop, Handshake } from "lucide-react";

export function DonationTypes() {
  const types = [
    { icon: <Wallet />, title: "Donación Económica", desc: "Aportes monetarios para sostener nuestros talleres y programas." },
    { icon: <Package />, title: "Insumos Educativos", desc: "Material didáctico, papelería y suministros para las clases." },
    { icon: <Laptop />, title: "Equipos y Materiales", desc: "Herramientas, computadores y mobiliario en buen estado." },
    { icon: <Handshake />, title: "Alianza Empresarial", desc: "Patrocinios y convenios de responsabilidad social corporativa." }
  ];

  return (
    <section className="py-20 bg-space-dark relative z-10 border-t border-space-border/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {types.map((type, i) => (
            <div key={i} className="bg-space-card/80 p-8 rounded-xl border border-space-border hover:border-gold-primary transition-colors text-center group">
              <div className="w-16 h-16 bg-gold-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <div className="text-gold-primary w-8 h-8 flex items-center justify-center">
                  {type.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{type.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{type.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
