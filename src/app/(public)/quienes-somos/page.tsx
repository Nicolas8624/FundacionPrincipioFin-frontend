import { Metadata } from "next";
import { AboutBanner } from "@/components/features/about/AboutBanner";
import { AboutHistory } from "@/components/features/about/AboutHistory";
import { MissionVision } from "@/components/features/about/MissionVision";
import { ValuesSection } from "@/components/features/home/ValuesSection";
import { ActionLines } from "@/components/features/about/ActionLines";

export const metadata: Metadata = {
  title: "Quiénes Somos | Fundación Principio & Fin",
  description: "Conoce nuestra historia, misión, visión y los valores institucionales que guían nuestro trabajo en las comunidades de Bogotá.",
};

import { DynamicGallery } from "@/components/common/DynamicGallery";

export default function AboutPage() {
  return (
    <>
      <AboutBanner />
      <AboutHistory />
      <MissionVision />
      <ValuesSection />
      <ActionLines />
      <section className="py-20 relative z-10 border-t border-space-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-montserrat tracking-wider text-gold-primary uppercase">Nuestra Galería</h2>
            <p className="text-gray-400 mt-4 font-inter max-w-2xl mx-auto">Un recorrido visual por nuestra historia y actividades.</p>
          </div>
          <DynamicGallery section="quienes-somos" />
        </div>
      </section>
    </>
  );
}
