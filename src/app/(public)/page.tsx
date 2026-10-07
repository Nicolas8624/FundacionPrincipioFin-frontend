import { HeroSection } from "@/components/features/home/HeroSection";
import { ImpactLinesSection } from "@/components/features/home/ImpactLinesSection";
import { BenefitsSection } from "@/components/features/home/BenefitsSection";
import { ValuesSection } from "@/components/features/home/ValuesSection";
import { HorizontalPropertySection } from "@/components/features/home/HorizontalPropertySection";
import { FinalCtaSection } from "@/components/features/home/FinalCtaSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fundación Principio & Fin | Podemos sanar y volver a comenzar",
  description: "Conectamos talentos y transformamos futuros a través del arte, la educación, la cultura y el emprendimiento en Bogotá.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ImpactLinesSection />
      <BenefitsSection />
      <ValuesSection />
      <HorizontalPropertySection />
      <FinalCtaSection />
    </>
  );
}
