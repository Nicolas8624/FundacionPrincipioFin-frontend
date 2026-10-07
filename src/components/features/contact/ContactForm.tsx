"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1500);
  };

  return (
    <section className="py-20 bg-space-black relative z-10 border-t border-space-border/50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-space-card/80 backdrop-blur-md border border-space-border rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-2">
              Envíanos un mensaje
            </h2>
            <p className="text-gray-400">
              ¿Tienes dudas o sugerencias? Escríbenos y te responderemos a la brevedad.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-gold-primary transition-colors"
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
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-gold-primary transition-colors"
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
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-gold-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300">
                  Asunto
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-gold-primary transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                Mensaje
              </label>
              <textarea
                id="message"
                rows={5}
                required
                className="w-full bg-space-black border border-space-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-gold-primary transition-colors resize-none"
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
                Acepto la política de tratamiento de datos personales para que la Fundación Principio & Fin se comunique conmigo.
              </label>
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
                  Enviar Mensaje <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
