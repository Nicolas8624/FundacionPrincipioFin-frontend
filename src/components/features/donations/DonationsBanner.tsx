export function DonationsBanner() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden /50">
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-wider mb-6">
          Donaciones y Alianzas
        </h1>
        <div className="w-24 h-1 bg-gold-primary mx-auto rounded-full mb-8"></div>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl leading-relaxed">
          Cada aporte representa una oportunidad de transformación para una familia y una comunidad.
        </p>
      </div>
    </section>
  );
}
