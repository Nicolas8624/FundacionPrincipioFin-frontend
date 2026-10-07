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

export default function AboutPage() {
  return (
    <>
      <AboutBanner />
      <AboutHistory />
      <MissionVision />
      <ValuesSection />
      <ActionLines />
    </>
  );
}
