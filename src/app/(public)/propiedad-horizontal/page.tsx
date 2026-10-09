import { Metadata } from "next";
import { PhBanner } from "@/components/features/ph-requests/PhBanner";
import { PhLetter } from "@/components/features/ph-requests/PhLetter";
import { PhBenefits } from "@/components/features/ph-requests/PhBenefits";
import { PhForm } from "@/components/features/ph-requests/PhForm";

export const metadata: Metadata = {
  title: "Propiedad Horizontal | Fundación Principio & Fin",
  description: "Propuesta de alianza para llevar programas de arte, educación y emprendimiento a los salones comunales de conjuntos residenciales.",
};

import { DynamicGallery } from "@/components/common/DynamicGallery";

export default function HorizontalPropertyPage() {
  return (
    <>
      <PhBanner />
      <PhLetter />
      <PhBenefits />
      <section className="py-20 relative z-10 border-t border-space-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-montserrat tracking-wider text-gold-primary uppercase">Galería de Proyectos PH</h2>
            <p className="text-gray-400 mt-4 font-inter max-w-2xl mx-auto">Conoce el impacto visual de nuestros programas en otras copropiedades.</p>
          </div>
          <DynamicGallery section="ph" />
        </div>
      </section>
      <PhForm />
    </>
  );
}
