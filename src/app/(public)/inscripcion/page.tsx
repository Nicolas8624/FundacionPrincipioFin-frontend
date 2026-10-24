import { Suspense } from "react";
import { Metadata } from "next";
import { EnrollmentBanner } from "@/components/features/enrollment/EnrollmentBanner";
import { EnrollmentForm } from "@/components/features/enrollment/EnrollmentForm";
import { createServerClient } from "@/services/supabase/server";

export const metadata: Metadata = {
  title: "Inscripción | Fundación Principio & Fin",
  description: "Inscríbete en nuestros cursos y talleres. Únete a nuestra comunidad de aprendizaje.",
};

export default async function EnrollmentPage() {
  let courses: { id: string; title: string; slug?: string }[] = [];

  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("courses")
      .select("id, title, slug")
      .eq("status", "publicado")
      .order("title");

    if (data && data.length > 0) {
      courses = data;
    }
  } catch (error) {
    console.warn("No se pudieron cargar los cursos desde Supabase en /inscripcion:", error);
  }

  return (
    <>
      <EnrollmentBanner />
      <Suspense fallback={<div className="py-20 text-center text-white">Cargando formulario...</div>}>
        <EnrollmentForm initialCourses={courses} />
      </Suspense>
    </>
  );
}
