"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Send } from "lucide-react";

const COURSES = [
  { id: "c1", title: "Pintura en Cerámica" },
  { id: "c2", title: "Pintura al Óleo" },
  { id: "c3", title: "Decoupage y Manualidades" },
  { id: "c4", title: "Diseño de Cejas" },
  { id: "c5", title: "Lifting de Pestañas" },
  { id: "c6", title: "Trenzas Kanekalon" },
  { id: "c7", title: "Iniciación Musical" },
  { id: "c8", title: "Electricidad Básica" },
];

export function EnrollmentForm() {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMinor, setIsMinor] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    const courseId = searchParams.get("curso");
    if (courseId) {
      setSelectedCourse(courseId);
    }
  }, [searchParams]);

  const calculateAge = (dob: string) => {
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms); 
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const age = calculateAge(e.target.value);
    setIsMinor(age < 18);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1500); // Mock
  };

  return (
    <section className="py-12 relative z-10 border-t border-space-border/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-space-card/80 backdrop-blur-md border border-space-border rounded-2xl p-6 md:p-10 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="course" className="block text-sm font-medium text-gray-300">
                Curso de interés
              </label>
              <select
                id="course"
                required
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-space-black border border-space-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-gold-primary transition-colors appearance-none"
              >
                <option value="" disabled>Selecciona un curso</option>
                {COURSES.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="fullname" className="block text-sm font-medium text-gray-300">
                Nombre Completo
              </label>
              <input
                type="text"
                id="fullname"
                required
                className="w-full bg-space-black border border-space-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-gold-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="doc_type" className="block text-sm font-medium text-gray-300">
                  Tipo de Documento
                </label>
                <select
                  id="doc_type"
                  required
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-gold-primary transition-colors appearance-none"
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="CE">Cédula de Extranjería</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="doc_number" className="block text-sm font-medium text-gray-300">
                  Número de Documento
                </label>
                <input
                  type="text"
                  id="doc_number"
                  required
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-gold-primary transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="dob" className="block text-sm font-medium text-gray-300">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  id="dob"
                  required
                  onChange={handleDateChange}
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-gold-primary transition-colors"
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
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-300">
                  Localidad / Barrio
                </label>
                <input
                  type="text"
                  id="location"
                  required
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-gold-primary transition-colors"
                />
              </div>
            </div>

            {isMinor && (
              <div className="space-y-2 p-4 bg-gold-primary/10 border border-gold-primary/30 rounded-lg">
                <label htmlFor="guardian" className="block text-sm font-medium text-gold-light">
                  Nombre del Acudiente (Requerido para menores de edad)
                </label>
                <input
                  type="text"
                  id="guardian"
                  required
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-gold-primary transition-colors"
                />
              </div>
            )}

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="data_policy"
                required
                className="mt-1 shrink-0 accent-gold-primary"
              />
              <label htmlFor="data_policy" className="text-sm text-gray-400 leading-tight">
                Autorizo el tratamiento de mis datos personales de acuerdo con la Ley 1581 de 2012, 
                para fines informativos y de registro por parte de la Fundación Principio & Fin.
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-gold-primary text-space-dark font-bold px-6 py-4 rounded-lg shadow-gold-glow hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {isSubmitting ? (
                "Procesando..."
              ) : (
                <>
                  Enviar Inscripción <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
