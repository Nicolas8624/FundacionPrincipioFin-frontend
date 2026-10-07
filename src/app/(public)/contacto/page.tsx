import { Metadata } from "next";
import { ContactInfoGrid } from "@/components/features/contact/ContactInfoGrid";
import { ContactForm } from "@/components/features/contact/ContactForm";
import { LocationMap } from "@/components/features/contact/LocationMap";

export const metadata: Metadata = {
  title: "Contacto | Fundación Principio & Fin",
  description: "Comunícate con la Fundación Principio & Fin. Encuentra nuestra dirección, teléfono, y formulario de contacto directo.",
};

export default function ContactPage() {
  return (
    <>
      <ContactInfoGrid />
      <ContactForm />
      <LocationMap />
    </>
  );
}
