import { StarfieldBackground } from "@/components/ui/StarfieldBackground";
import { EarthBackground } from "@/components/ui/EarthBackground";
import { Construction, ArrowLeft, LogOut } from 'lucide-react';
import Link from 'next/link';
import { createServerClient } from '@/services/supabase/server';
import { redirect } from 'next/navigation';
import { signout } from '@/app/(admin)/actions';

export default async function PortalPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-inter bg-transparent p-6">
      <StarfieldBackground />
      <EarthBackground />

      <div className="relative z-10 w-full max-w-2xl p-10 rounded-2xl bg-[#0A0A0E]/80 backdrop-blur-xl border border-[#4d4635] shadow-2xl text-center">
        
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#1b1b1f] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Construction className="w-8 h-8" />
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-widest text-[#D4AF37] font-montserrat uppercase mb-4">
          Portal en Construcción
        </h1>
        
        <p className="text-[#d0c5af] text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-8">
          Hola <span className="font-semibold text-white">{user.user_metadata?.full_name || 'Usuario'}</span>, 
          actualmente estamos diseñando esta sección exclusiva para ti. 
          Muy pronto podrás acceder a tus cursos, descargar certificados y gestionar todas tus inscripciones desde aquí.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="px-6 py-3 rounded-lg border border-[#4d4635] text-[#e4e1e7] hover:bg-[#1b1b1f] hover:border-[#D4AF37] transition-all font-medium text-sm flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al sitio público
          </Link>

          <form action={signout}>
            <button className="px-6 py-3 rounded-lg bg-[#D4AF37] text-[#0A0A0E] hover:bg-[#F5D77A] transition-all font-bold text-sm flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
