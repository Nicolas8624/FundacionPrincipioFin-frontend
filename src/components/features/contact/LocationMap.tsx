import { FOUNDATION } from "@/constants/foundation";
import { MapPin } from "lucide-react";

export function LocationMap() {
  return (
    <section className="py-20 bg-space-dark relative z-10 border-t border-space-border/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-wider mb-4">
            Nuestra Sede
          </h2>
          <div className="flex items-center justify-center gap-2 text-gold-primary">
            <MapPin className="w-5 h-5" />
            <span className="font-medium tracking-widest uppercase">{FOUNDATION.contact.address}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto h-[400px] bg-space-card/80 border border-space-border rounded-2xl overflow-hidden shadow-xl relative">
          {/* Simulated Map / Placeholder for actual iframe */}
          <div className="absolute inset-0 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 bg-space-black border border-gold-primary rounded-full flex items-center justify-center mb-4 shadow-gold-glow animate-bounce">
              <MapPin className="w-8 h-8 text-gold-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{FOUNDATION.name}</h3>
            <p className="text-gray-400 max-w-sm">
              Visítanos para conocer más sobre nuestros programas y cómo puedes involucrarte en nuestra misión.
            </p>
            <a 
              href={`https://maps.google.com/?q=${encodeURIComponent(FOUNDATION.contact.address)}`} 
              target="_blank"
              rel="noreferrer"
              className="mt-6 px-6 py-2 bg-space-border text-white rounded-md hover:bg-gold-primary hover:text-space-dark transition-colors font-medium text-sm"
            >
              Abrir en Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
