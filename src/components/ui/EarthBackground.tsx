import Image from "next/image";

export function EarthBackground() {
  return (
    <div className="fixed bottom-0 right-0 w-[100vw] md:w-[70vw] h-[60vh] md:h-[90vh] pointer-events-none -z-[5] opacity-40">
      <div 
        className="absolute inset-0" 
        style={{
          maskImage: 'radial-gradient(circle at bottom right, black 10%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at bottom right, black 10%, transparent 80%)'
        }}
      >
        <Image
          src="/images/earth-night.jpg"
          alt="Earth night view"
          fill
          className="object-cover object-right-bottom mix-blend-screen"
          priority
          quality={90}
        />
      </div>
    </div>
  );
}
