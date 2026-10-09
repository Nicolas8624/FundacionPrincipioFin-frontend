import Link from 'next/link';
import { ChevronLeft, Hammer } from 'lucide-react';
import Image from 'next/image';

export default function CourseDetailsPlaceholderPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-[1600px] mx-auto min-h-[70vh] flex flex-col items-center justify-center space-y-8 pb-10">
      
      <div className="w-full flex justify-start mb-8">
        <Link 
          href="/admin/cursos" 
          className="flex items-center gap-2 text-[#d0c5af] hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Volver a Programas Formativos</span>
        </Link>
      </div>

      <div className="relative w-64 h-64 md:w-80 md:h-80 opacity-80 animate-pulse-slow">
        <Image
          src="/images/onboarding/planet3.png"
          alt="Planeta en construcción"
          fill
          className="object-contain drop-shadow-[0_0_50px_rgba(212,175,55,0.15)]"
        />
      </div>

      <div className="text-center space-y-4 max-w-2xl px-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
            <Hammer className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-semibold font-montserrat tracking-wide text-white">
          Aula Virtual en Construcción
        </h1>
        <p className="text-[#99907c] text-lg max-w-xl mx-auto">
          Próximamente podrás gestionar el mini classroom de este programa (ID: <span className="font-mono text-[#d0c5af] text-sm">{params.id}</span>).
          Aquí podrás ver los estudiantes inscritos, subir materiales, asignar tareas y revisar las entregas.
        </p>
      </div>
      
    </div>
  );
}
