"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { submitEnrollment } from "@/actions/enrollment";

export interface CourseOption {
  id: string;
  title: string;
  slug?: string;
  legacyId?: string;
}

const DEFAULT_COURSES: CourseOption[] = [
  { id: "a8c005e1-a672-4eda-94e1-b1de8114af7a", title: "Pintura en cerámica", slug: "pintura-en-ceramica", legacyId: "c1" },
  { id: "fc025e56-2e84-4b56-bb91-1c12fadd857c", title: "Pintura al óleo", slug: "pintura-al-oleo", legacyId: "c2" },
  { id: "0f7aa4ba-4f07-42ba-82ee-961c2828d5ca", title: "Decoupage y manualidades", slug: "decoupage-y-manualidades", legacyId: "c3" },
  { id: "eb739f15-f73f-49e4-8dc2-da4014ca109f", title: "Diseño de cejas", slug: "diseno-de-cejas", legacyId: "c4" },
  { id: "3df312ff-ef37-4351-ae0b-74499a6cb640", title: "Lifting de pestañas", slug: "lifting-de-pestanas", legacyId: "c5" },
  { id: "78fcc226-1d12-41b5-a875-9b91bec51165", title: "Trenzas con Kanekalon", slug: "trenzas-con-kanekalon", legacyId: "c6" },
  { id: "1d3d1105-2293-4fa5-a611-6264bc9283e6", title: "Iniciación musical (piano y violín)", slug: "iniciacion-musical", legacyId: "c7" },
  { id: "3710cfee-4768-4a07-afc3-b4687a48fb1a", title: "Electricidad y mecánica automotriz", slug: "electricidad-y-mecanica-automotriz", legacyId: "c8" },
  { id: "aeb2418f-7821-40ad-9c98-01332671b8dc", title: "Formulación de proyectos", slug: "formulacion-de-proyectos" },
  { id: "9042432a-18df-43b2-906e-2fd8730360e8", title: "Creación de emprendimientos", slug: "creacion-de-emprendimientos" },
];

interface EnrollmentFormProps {
  initialCourses?: CourseOption[];
}

export function EnrollmentForm({ initialCourses = [] }: EnrollmentFormProps) {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isMinor, setIsMinor] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");

  const coursesList = useMemo(() => {
    if (initialCourses && initialCourses.length > 0) {
      // Cruzar con DEFAULT_COURSES para mantener legacyIds si aplica
      return initialCourses.map((c) => {
        const found = DEFAULT_COURSES.find(
          (dc) => dc.id === c.id || dc.slug === c.slug || dc.title.toLowerCase() === c.title.toLowerCase()
        );
        return {
          id: c.id,
          title: c.title,
          slug: c.slug || found?.slug,
          legacyId: found?.legacyId,
        };
      });
    }
    return DEFAULT_COURSES;
  }, [initialCourses]);

  useEffect(() => {
    const courseParam = searchParams.get("curso");
    if (!courseParam) return;

    const lowerParam = courseParam.toLowerCase();
    const matched = coursesList.find(
      (c) =>
        c.id.toLowerCase() === lowerParam ||
        c.legacyId?.toLowerCase() === lowerParam ||
        c.slug?.toLowerCase() === lowerParam ||
        c.title.toLowerCase() === lowerParam ||
        c.title.toLowerCase().includes(lowerParam)
    );

    if (matched) {
      setSelectedCourse(matched.id);
    } else {
      setSelectedCourse(courseParam);
    }
  }, [searchParams, coursesList]);

  const calculateAge = (dob: string) => {
    if (!dob) return 18;
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const age = calculateAge(e.target.value);
    setIsMinor(age < 18);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    setIsSuccess(false);
    setErrorMsg("");

    const formData = new FormData(form);
    const result = await submitEnrollment(formData);

    if (result.success) {
      setIsSuccess(true);
      setErrorMsg("");
      form.reset();
      setSelectedCourse("");
      setIsMinor(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setIsSuccess(false);
      setErrorMsg(result.error || "Ocurrió un error inesperado al enviar la inscripción.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    setIsSubmitting(false);
  };

  return (
    <section className="py-12 relative z-10 border-t border-space-border/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-space-card/80 backdrop-blur-md border border-space-border rounded-2xl p-6 md:p-10 shadow-xl">
          {isSuccess && (
            <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 animate-fade-in relative z-10 backdrop-blur-md">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-emerald-200 text-sm">
                <p className="font-semibold mb-1">¡Inscripción radicada con éxito!</p>
                <p className="leading-relaxed">
                  Hemos registrado tus datos en el sistema oficial de la Fundación Principio &amp; Fin. Nos comunicaremos contigo para coordinar el inicio de tus talleres.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-fade-in relative z-10 backdrop-blur-md">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-red-200 text-sm">
                <p className="font-semibold mb-1">No se pudo procesar la inscripción</p>
                <p className="break-words leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="course" className="block text-sm font-medium text-gray-300">
                Curso o Taller de interés <span className="text-[#ffb4ab]">*</span>
              </label>
              <select
                id="course"
                name="course_id"
                required
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-space-black border border-space-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-gold-primary transition-colors appearance-none"
              >
                <option value="" disabled>Selecciona un curso o taller</option>
                {coursesList.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="fullname" className="block text-sm font-medium text-gray-300">
                Nombre Completo <span className="text-[#ffb4ab]">*</span>
              </label>
              <input
                type="text"
                id="fullname"
                name="full_name"
                required
                placeholder="Nombres y apellidos completos"
                className="w-full bg-space-black border border-space-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-gold-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="doc_type" className="block text-sm font-medium text-gray-300">
                  Tipo de Documento <span className="text-[#ffb4ab]">*</span>
                </label>
                <select
                  id="doc_type"
                  name="document_type"
                  required
                  defaultValue="CC"
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-gold-primary transition-colors appearance-none"
                >
                  <option value="CC">Cédula de Ciudadanía (CC)</option>
                  <option value="TI">Tarjeta de Identidad (TI)</option>
                  <option value="CE">Cédula de Extranjería (CE)</option>
                  <option value="PA">Pasaporte (PA)</option>
                  <option value="RC">Registro Civil (RC)</option>
                  <option value="Otro">Otro documento</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="doc_number" className="block text-sm font-medium text-gray-300">
                  Número de Documento <span className="text-[#ffb4ab]">*</span>
                </label>
                <input
                  type="text"
                  id="doc_number"
                  name="document_number"
                  required
                  placeholder="Ej. 1020304050"
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
                  name="birth_date"
                  max={new Date().toISOString().split("T")[0]}
                  onChange={handleDateChange}
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-gold-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                  Teléfono / WhatsApp <span className="text-[#ffb4ab]">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  placeholder="Ej. 3001234567"
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-gold-primary transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Correo Electrónico <span className="text-[#ffb4ab]">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="nombre@correo.com"
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-gold-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-300">
                  Localidad / Barrio de Residencia <span className="text-[#ffb4ab]">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="locality"
                  required
                  placeholder="Ej. San Cristóbal, Kennedy, Suba..."
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-gold-primary transition-colors"
                />
              </div>
            </div>

            {isMinor && (
              <div className="space-y-2 p-4 bg-gold-primary/10 border border-gold-primary/30 rounded-lg animate-fade-in">
                <label htmlFor="guardian" className="block text-sm font-medium text-gold-light">
                  Nombre del Acudiente / Representante Legal (Requerido para menores) <span className="text-[#ffb4ab]">*</span>
                </label>
                <input
                  type="text"
                  id="guardian"
                  name="guardian_name"
                  required={isMinor}
                  placeholder="Nombre y apellido del adulto responsable"
                  className="w-full bg-space-black border border-space-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-gold-primary transition-colors"
                />
              </div>
            )}

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="data_policy"
                name="accepted_data_policy"
                required
                className="mt-1 shrink-0 accent-gold-primary cursor-pointer"
              />
              <label htmlFor="data_policy" className="text-sm text-gray-400 leading-tight cursor-pointer">
                Autorizo el tratamiento de mis datos personales de acuerdo con la Ley 1581 de 2012, 
                para fines informativos y de registro por parte de la Fundación Principio &amp; Fin.
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-gold-primary text-space-dark font-bold px-6 py-4 rounded-lg shadow-gold-glow hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider cursor-pointer"
            >
              {isSubmitting ? (
                "Procesando inscripción..."
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
