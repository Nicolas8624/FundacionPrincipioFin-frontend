"use client";

import { register } from './actions';
import { StarfieldBackground } from "@/components/ui/StarfieldBackground";
import { EarthBackground } from "@/components/ui/EarthBackground";
import { AtSign, Eye, EyeOff, UserPlus, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function RegisterContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative z-10 w-full max-w-[420px] p-10 rounded-2xl bg-[#0A0A0E]/80 backdrop-blur-xl border border-[#4d4635] shadow-2xl my-8">
      <div className="flex justify-center mb-8">
        <img 
          src="/images/logo-admin.png" 
          alt="Logo Fundación Principio y Fin" 
          className="h-16 object-contain"
        />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-[24px] font-semibold tracking-[0.15em] text-[#e4e1e7] font-montserrat uppercase mb-3 leading-snug">
          Crear<br/>Cuenta
        </h1>
      </div>

      <form className="space-y-5" action={register}>
        <div>
          <label className="block text-[10px] font-montserrat uppercase tracking-[0.18em] text-[#e4e1e7] mb-2 font-semibold">
            Nombre Completo
          </label>
          <div className="relative">
            <input
              name="name"
              type="text"
              required
              className="w-full bg-[#1b1b1f] border border-[#4d4635] rounded-lg pl-4 pr-10 py-3 text-[#e4e1e7] focus:outline-none focus:border-[#D4AF37] transition-colors text-sm placeholder:text-[#42454a]"
              placeholder="Juan Pérez"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#99907c]">
              <User className="w-[18px] h-[18px]" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-montserrat uppercase tracking-[0.18em] text-[#e4e1e7] mb-2 font-semibold">
            Correo Electrónico
          </label>
          <div className="relative">
            <input
              name="email"
              type="email"
              required
              className="w-full bg-[#1b1b1f] border border-[#4d4635] rounded-lg pl-4 pr-10 py-3 text-[#e4e1e7] focus:outline-none focus:border-[#D4AF37] transition-colors text-sm placeholder:text-[#42454a]"
              placeholder="usuario@correo.com"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#99907c]">
              <AtSign className="w-[18px] h-[18px]" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-montserrat uppercase tracking-[0.18em] text-[#e4e1e7] mb-2 font-semibold">
            Contraseña
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              className="w-full bg-[#1b1b1f] border border-[#4d4635] rounded-lg pl-4 pr-10 py-3 text-[#e4e1e7] focus:outline-none focus:border-[#D4AF37] transition-colors text-sm placeholder:text-[#42454a] tracking-[0.2em]"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37] cursor-pointer hover:text-[#F5D77A] transition-colors"
            >
              {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>

        {message && (
          <div className="p-3 bg-[#93000a]/20 border border-[#93000a] rounded text-[#ffb4ab] text-xs font-inter text-center">
            {message}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#e1c469] text-[#0A0A0E] font-montserrat font-semibold tracking-[0.15em] py-[14px] px-6 rounded-lg hover:shadow-[0_0_25px_rgba(212,175,55,0.25)] transition-all flex items-center justify-center gap-2 text-sm"
          >
            REGISTRARSE
            <UserPlus className="w-[18px] h-[18px] ml-1" />
          </button>
        </div>
      </form>

      <div className="mt-8 space-y-7">
        <div className="text-center text-[13px] font-inter text-[#d0c5af]">
          ¿Ya tienes cuenta? <Link href="/login" className="text-[#D4AF37] hover:text-[#F5D77A] underline underline-offset-[5px] decoration-[#D4AF37]/40 hover:decoration-[#F5D77A] transition-all font-medium ml-1">Inicia sesión</Link>
        </div>

        <div className="pt-6 border-t border-[#4d4635] text-center">
          <p className="text-[10px] font-montserrat uppercase tracking-[0.25em] text-[#99907c]">
            Fundación Principio & Fin
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-inter bg-transparent py-10">
      <StarfieldBackground />
      <EarthBackground />
      <Suspense fallback={<div className="relative z-10 w-full max-w-[420px] h-[500px] bg-[#0A0A0E]/80 backdrop-blur-xl border border-[#4d4635] rounded-2xl"></div>}>
        <RegisterContent />
      </Suspense>
    </div>
  );
}
