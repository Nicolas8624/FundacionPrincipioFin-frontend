import { FOUNDATION } from "@/constants/foundation";

export function AboutBanner() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden /50">
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-wider mb-6">
          Quiénes Somos
        </h1>
        <div className="w-24 h-1 bg-gold-primary mx-auto rounded-full mb-8"></div>
        <p className="text-xl md:text-2xl text-gold-light italic max-w-3xl leading-relaxed font-medium">
          "{FOUNDATION.slogans[0]}"
        </p>
      </div>
    </section>
  );
}
