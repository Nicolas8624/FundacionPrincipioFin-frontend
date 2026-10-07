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
    <section className="py-20 relative z-10 border-t border-space-border/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-space-card/40 border border-space-border/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gold-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="text-center mb-8 relative z-10">
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
                <label htmlFor="name" className="text-gray-200 font-medium text-sm mb-2 block">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="w-full bg-space-black/60 border border-space-border/80 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/50 transition-all shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-gray-200 font-medium text-sm mb-2 block">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  className="w-full bg-space-black/60 border border-space-border/80 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/50 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-gray-200 font-medium text-sm mb-2 block">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full bg-space-black/60 border border-space-border/80 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/50 transition-all shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-gray-200 font-medium text-sm mb-2 block">
                  Asunto
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  className="w-full bg-space-black/60 border border-space-border/80 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/50 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-gray-200 font-medium text-sm mb-2 block">
                Mensaje
              </label>
              <textarea
                id="message"
                rows={5}
                required
                className="w-full bg-space-black/60 border border-space-border/80 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/50 transition-all shadow-inner resize-none"
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

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-gold-primary to-gold-light text-space-dark font-bold rounded-xl hover:shadow-gold-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {isSubmitting ? (
                  "Enviando..."
                ) : (
                  <>
                    Enviar Mensaje <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
