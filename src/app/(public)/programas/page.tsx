import { Metadata } from "next";
import { CoursesBanner } from "@/components/features/courses/CoursesBanner";
import { CourseGrid } from "@/components/features/courses/CourseGrid";

export const metadata: Metadata = {
  title: "Programas y Cursos | Fundación Principio & Fin",
  description: "Descubre nuestros programas de arte, belleza, educación y oficios. Inscríbete y desarrolla nuevas habilidades con nosotros.",
};

export default function ProgramsPage() {
  return (
    <>
      <CoursesBanner />
      <CourseGrid />
    </>
  );
}
