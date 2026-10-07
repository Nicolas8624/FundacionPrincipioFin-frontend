import { FOUNDATION } from "@/constants/foundation";
import { Mail, MapPin, Phone, Clock } from "lucide-react";

export function ContactInfoGrid() {
  const infos = [
    { icon: <Phone />, title: "Teléfono / WhatsApp", detail: FOUNDATION.contact.phone },
    { icon: <Mail />, title: "Correo Electrónico", detail: FOUNDATION.contact.email },
    { icon: <MapPin />, title: "Dirección", detail: FOUNDATION.contact.address },
    { icon: <Clock />, title: "Horario de Atención", detail: "Lunes a Sábados 8:00 a.m. - 6:00 p.m." },
  ];

  return (
    <section className="py-20 bg-space-dark relative z-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-wider mb-6">
            Contacto
          </h1>
          <div className="w-24 h-1 bg-gold-primary mx-auto rounded-full mb-8"></div>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Estamos aquí para escucharte. Comunícate con nosotros a través de cualquiera de nuestros canales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {infos.map((info, i) => (
            <div key={i} className="flex flex-col items-center text-center p-8 bg-space-card/80 border border-space-border rounded-xl hover:border-gold-primary/50 transition-colors">
              <div className="text-gold-primary w-12 h-12 mb-4">
                {info.icon}
              </div>
              <h3 className="text-white font-semibold mb-2">{info.title}</h3>
              <p className="text-gray-400 text-sm">{info.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
