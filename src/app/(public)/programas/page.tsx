import { Metadata } from "next";
import { CoursesBanner } from "@/components/features/courses/CoursesBanner";
import { CourseGrid } from "@/components/features/courses/CourseGrid";

export const metadata: Metadata = {
  title: "Programas y Cursos | Fundación Principio & Fin",
  description: "Descubre nuestros programas de arte, belleza, educación y oficios. Inscríbete y desarrolla nuevas habilidades con nosotros.",
};

import { DynamicGallery } from "@/components/common/DynamicGallery";

export default function ProgramsPage() {
  return (
    <>
      <CoursesBanner />
      <CourseGrid />
      <section className="py-20 relative z-10 border-t border-space-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-montserrat tracking-wider text-gold-primary uppercase">Muestras de Nuestros Estudiantes</h2>
            <p className="text-gray-400 mt-4 font-inter max-w-2xl mx-auto">Explora algunos de los trabajos y momentos capturados en nuestros programas de formación.</p>
          </div>
          <DynamicGallery section="programas" />
        </div>
      </section>
    </>
  );
}
