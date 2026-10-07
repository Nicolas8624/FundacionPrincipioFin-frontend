import { Suspense } from "react";
import { Metadata } from "next";
import { EnrollmentBanner } from "@/components/features/enrollment/EnrollmentBanner";
import { EnrollmentForm } from "@/components/features/enrollment/EnrollmentForm";

export const metadata: Metadata = {
  title: "Inscripción | Fundación Principio & Fin",
  description: "Inscríbete en nuestros cursos y talleres. Únete a nuestra comunidad de aprendizaje.",
};

export default function EnrollmentPage() {
  return (
    <>
      <EnrollmentBanner />
      <Suspense fallback={<div className="py-20 text-center text-white">Cargando formulario...</div>}>
        <EnrollmentForm />
      </Suspense>
    </>
  );
}
