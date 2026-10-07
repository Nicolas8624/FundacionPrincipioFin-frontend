import { FOUNDATION } from "@/constants/foundation";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href={FOUNDATION.contact.whatsappUrl}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#25D366]/50"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-8 w-8" />
    </a>
  );
}
