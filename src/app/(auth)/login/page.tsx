import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      {/* Background Blur Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px]" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-surface-container-low/70 backdrop-blur-xl border border-outline-variant shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-widest text-primary font-montserrat uppercase mb-2">
            Sanctuary Admin
          </h1>
          <p className="text-on-surface-variant text-sm font-inter">
            Ingresa al portal administrativo
          </p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-xs font-montserrat uppercase tracking-widest text-on-surface-variant mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              className="w-full bg-surface/50 border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
              placeholder="admin@fundacion.org"
            />
          </div>

          <div>
            <label className="block text-xs font-montserrat uppercase tracking-widest text-on-surface-variant mb-2">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full bg-surface/50 border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="button"
            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#0A0A0E] font-montserrat font-bold uppercase tracking-widest py-3 px-6 rounded-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.40)] transition-all"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}
