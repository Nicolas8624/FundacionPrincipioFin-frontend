import { Metadata } from "next";
import { DonationsBanner } from "@/components/features/donations/DonationsBanner";
import { DonationTypes } from "@/components/features/donations/DonationTypes";
import { DonationForm } from "@/components/features/donations/DonationForm";

export const metadata: Metadata = {
  title: "Donaciones y Alianzas | Fundación Principio & Fin",
  description: "Conoce las diferentes formas de apoyar nuestra misión y transformar vidas en Bogotá.",
};

export default function DonationsPage() {
  return (
    <>
      <DonationsBanner />
      <DonationTypes />
      <DonationForm />
    </>
  );
}
