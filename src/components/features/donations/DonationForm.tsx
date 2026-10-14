"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { submitDonation } from "@/actions/donation";

export function DonationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSuccess(false);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const result = await submitDonation(formData);

    if (result.success) {
      setIsSuccess(true);
      e.currentTarget.reset();
    } else {
      setErrorMsg(result.error || "Ocurrió un error inesperado al enviar la solicitud.");
    }
    
    setIsSubmitting(false);
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

          {isSuccess && (
            <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-4 animate-fade-in relative z-10 backdrop-blur-md">
              <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
              <p className="text-green-200">
                ¡Gracias por tu intención de donación! Nos pondremos en contacto contigo pronto.
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
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Nombre o Razón Social
              </label>
              <input
                type="text"
                id="name"
                name="full_name"
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
                name="donation_type"
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
                  name="phone"
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
                  name="email"
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
                name="amount_or_description"
                rows={4}
                required
                className="w-full bg-space-black border border-space-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-gold-primary transition-colors resize-none"
                placeholder="Cuéntanos más sobre cómo deseas ayudar..."
              ></textarea>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="data_policy"
                name="data_consent"
                required
                className="mt-1 shrink-0 accent-gold-primary"
              />
              <label htmlFor="data_policy" className="text-sm text-gray-400 leading-tight">
                Autorizo el tratamiento de mis datos personales para que la Fundación Principio & Fin se comunique conmigo respecto a esta donación.
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
