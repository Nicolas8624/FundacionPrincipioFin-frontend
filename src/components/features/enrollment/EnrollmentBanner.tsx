export function EnrollmentBanner() {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden /50">
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider mb-6">
          Formulario de Inscripción
        </h1>
        <div className="w-24 h-1 bg-gold-primary mx-auto rounded-full mb-8"></div>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
          Estás a un paso de comenzar tu formación. Por favor, completa tus datos para asegurar tu cupo en nuestros talleres.
        </p>
      </div>
    </section>
  );
}
