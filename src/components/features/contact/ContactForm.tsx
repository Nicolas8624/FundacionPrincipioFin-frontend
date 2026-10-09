"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { submitContactForm } from "@/actions/contact";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSuccess(false);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const result = await submitContactForm(formData);

    if (result.success) {
      setIsSuccess(true);
      e.currentTarget.reset();
    } else {
      setErrorMsg(result.error || "Ocurrió un error inesperado al enviar el mensaje.");
    }
    
    setIsSubmitting(false);
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

          {isSuccess && (
            <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-4 animate-fade-in relative z-10 backdrop-blur-md">
              <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
              <p className="text-green-200">
                ¡Gracias por escribirnos! Tu mensaje ha sido enviado con éxito y nos pondremos en contacto contigo pronto.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-4 animate-fade-in relative z-10 backdrop-blur-md">
              <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
              <p className="text-red-200">
                {errorMsg}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-gray-200 font-medium text-sm mb-2 block">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
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
                  name="phone"
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
                  name="email"
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
                  name="subject"
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
                name="message"
                rows={5}
                required
                className="w-full bg-space-black/60 border border-space-border/80 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/50 transition-all shadow-inner resize-none"
              ></textarea>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="data_policy"
                name="data_policy"
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
