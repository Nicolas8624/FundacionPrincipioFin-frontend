import { Metadata } from "next";
import { PhBanner } from "@/components/features/ph-requests/PhBanner";
import { PhLetter } from "@/components/features/ph-requests/PhLetter";
import { PhBenefits } from "@/components/features/ph-requests/PhBenefits";
import { PhForm } from "@/components/features/ph-requests/PhForm";

export const metadata: Metadata = {
  title: "Propiedad Horizontal | Fundación Principio & Fin",
  description: "Propuesta de alianza para llevar programas de arte, educación y emprendimiento a los salones comunales de conjuntos residenciales.",
};

export default function HorizontalPropertyPage() {
  return (
    <>
      <PhBanner />
      <PhLetter />
      <PhBenefits />
      <PhForm />
    </>
  );
}
