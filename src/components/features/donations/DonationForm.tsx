"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function DonationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1500);
  };

  return (
    <section className="py-20 relative z-10 border-t border-space-border/50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-space-card/80 backdrop-blur-md border border-space-border rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-2">
              Coordinar Aporte o Patrocinio
            </h2>
            <p className="text-gray-400">
              Déjanos tus datos y nos pondremos en contacto contigo para gestionar tu ayuda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Nombre o Razón Social
              </label>
              <input
                type="text"
                id="name"
                required
                className="w-full bg-space-black border border-space-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-gold-primary transition-colors"
                placeholder="Ej. Empresa S.A.S o Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="block text-sm font-medium text-gray-300">
                Tipo de Aporte
              </label>
              <select
                id="type"
                required
                className="w-full bg-space-black border border-space-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-gold-primary transition-colors appearance-none"
              >
                <option value="">Selecciona una opción</option>
                <option value="economica">Donación Económica</option>
                <option value="insumos">Insumos Educativos</option>
                <option value="equipos">Equipos y Materiales</option>
                <option value="alianza">Alianza Empresarial</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-gold-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-gold-primary transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="details" className="block text-sm font-medium text-gray-300">
                Detalles del Aporte
              </label>
              <textarea
                id="details"
                rows={4}
                required
                className="w-full bg-space-black border border-space-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-gold-primary transition-colors resize-none"
                placeholder="Cuéntanos más sobre cómo deseas ayudar..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-gold-primary text-space-dark font-bold px-6 py-4 rounded-lg shadow-gold-glow hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
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
