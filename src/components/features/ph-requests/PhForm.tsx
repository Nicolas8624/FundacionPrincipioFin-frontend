"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function PhForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect with Supabase via Dev 1 client in Phase 3
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1500); // Temporary mock
  };

  return (
    <section className="py-20 bg-space-dark relative z-10 border-t border-space-border/50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-space-card/80 backdrop-blur-md border border-space-border rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-2">
              Solicitud de Alianza
            </h2>
            <p className="text-gray-400">
              Completa este formulario y nos pondremos en contacto para coordinar una reunión.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="ph_name" className="block text-sm font-medium text-gray-300">
                  Nombre del Conjunto / Unidad
                </label>
                <input
                  type="text"
                  id="ph_name"
                  required
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-gold-primary transition-colors"
                  placeholder="Ej. Conjunto Residencial Los Pinos"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="admin_name" className="block text-sm font-medium text-gray-300">
                  Nombre del Administrador / Consejero
                </label>
                <input
                  type="text"
                  id="admin_name"
                  required
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-gold-primary transition-colors"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-gold-primary transition-colors"
                  placeholder="administracion@conjunto.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-gold-primary transition-colors"
                  placeholder="300 000 0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-300">
                Localidad y Barrio
              </label>
              <input
                type="text"
                id="location"
                required
                className="w-full bg-space-black border border-space-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-gold-primary transition-colors"
                placeholder="Ej. Ciudad Bolívar, Barrio Madelena"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                Mensaje / Solicitud adicional
              </label>
              <textarea
                id="message"
                rows={4}
                required
                className="w-full bg-space-black border border-space-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-gold-primary transition-colors resize-none"
                placeholder="Cuéntanos un poco sobre tu comunidad..."
              ></textarea>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="data_policy"
                required
                className="mt-1 shrink-0 accent-gold-primary"
              />
              <label htmlFor="data_policy" className="text-sm text-gray-400 leading-tight">
                Acepto la política de tratamiento de datos personales. Autorizo a la Fundación Principio & Fin a 
                contactarme para dar respuesta a esta solicitud.
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-gold-primary text-space-dark font-bold px-6 py-3 rounded-lg shadow-gold-glow hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                "Enviando..."
              ) : (
                <>
                  Enviar Solicitud <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
