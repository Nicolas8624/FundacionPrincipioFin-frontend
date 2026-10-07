export function PhBanner() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-space-black/50">
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider mb-6 max-w-4xl leading-tight">
          Propuesta para Propiedades Horizontales
        </h1>
        <div className="w-24 h-1 bg-gold-primary mx-auto rounded-full mb-8"></div>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
          Dirigida a Administradores y Consejos de Administración comprometidos con el desarrollo integral de su comunidad.
        </p>
      </div>
    </section>
  );
}
