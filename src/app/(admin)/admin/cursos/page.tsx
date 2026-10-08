import { BookOpen, Plus, Search, Filter, MoreVertical, MapPin, Users } from 'lucide-react';

export default function AdminCursosPage() {
  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            Gestión Académica
          </p>
          <h1 className="text-4xl font-semibold font-montserrat tracking-wide text-white">
            Catálogo de Cursos
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#99907c]" />
            <input 
              type="text" 
              placeholder="Buscar cursos..." 
              className="bg-[#1b1b1f] border border-[#262629] pl-10 pr-4 py-2.5 rounded-lg text-[#e4e1e7] text-sm focus:outline-none focus:border-[#D4AF37] transition-colors w-64"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#1b1b1f] border border-[#262629] hover:border-[#D4AF37] text-[#d0c5af] px-4 py-2.5 rounded-lg text-sm transition-colors">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#e1c469] text-[#0A0A0E] px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors uppercase tracking-wider font-montserrat">
            <Plus className="w-4 h-4" />
            Nuevo Curso
          </button>
        </div>
      </div>

      {/* Grid de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <CourseCard 
          title="Pintura y Expresión Artística"
          category="Arte"
          status="PUBLICADO"
          students={24}
          modality="Presencial"
          location="Sede Principal - Suba"
          image="/images/placeholder-art.jpg"
        />

        <CourseCard 
          title="Emprendimiento Digital 101"
          category="Educación"
          status="PUBLICADO"
          students={45}
          modality="Virtual"
          location="Plataforma Online"
          image="/images/placeholder-tech.jpg"
        />

        <CourseCard 
          title="Guitarra Acústica Básica"
          category="Cultura"
          status="BORRADOR"
          students={0}
          modality="Presencial"
          location="Sede Principal - Suba"
          image="/images/placeholder-music.jpg"
        />

        <CourseCard 
          title="Inglés Conversacional B1"
          category="Educación"
          status="CERRADO"
          students={30}
          modality="Presencial"
          location="Conjunto Altagracia"
          image="/images/placeholder-english.jpg"
        />
        
      </div>
    </div>
  );
}

function CourseCard({ title, category, status, students, modality, location, image }: any) {
  const getStatusColor = (s: string) => {
    if (s === 'PUBLICADO') return 'bg-[#D4AF37] text-[#0A0A0E]';
    if (s === 'BORRADOR') return 'bg-[#262629] text-[#99907c]';
    return 'bg-[#93000a] text-[#ffb4ab]';
  }

  return (
    <div className="rounded-2xl bg-[#17171a] border border-[#262629] overflow-hidden hover:border-[#D4AF37]/50 transition-all group flex flex-col">
      {/* Image Header */}
      <div className="h-40 bg-[#1b1b1f] relative border-b border-[#262629] overflow-hidden">
        {/* Placeholder gradient instead of actual image for now */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#262629] to-[#0A0A0E] opacity-50 group-hover:scale-105 transition-transform duration-500"></div>
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <button className="w-8 h-8 rounded-full bg-[#0A0A0E]/80 text-[#d0c5af] hover:text-[#D4AF37] flex items-center justify-center transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2">
          {category}
        </p>
        <h3 className="text-lg font-semibold text-[#e4e1e7] mb-4 leading-tight group-hover:text-[#D4AF37] transition-colors">
          {title}
        </h3>

        <div className="space-y-3 mb-6 flex-1">
          <div className="flex items-center gap-3 text-sm text-[#99907c]">
            <BookOpen className="w-4 h-4" />
            <span>Modalidad: <span className="text-[#d0c5af]">{modality}</span></span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#99907c]">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#99907c]">
            <Users className="w-4 h-4" />
            <span><span className="text-[#e4e1e7] font-medium">{students}</span> estudiantes inscritos</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#262629] flex justify-between items-center">
          <button className="text-xs font-montserrat font-semibold tracking-wider uppercase text-[#99907c] hover:text-[#D4AF37] transition-colors">
            Editar Contenido
          </button>
          <button className="text-xs font-montserrat font-semibold tracking-wider uppercase text-[#D4AF37] hover:text-[#F5D77A] transition-colors">
            Ver Detalles →
          </button>
        </div>
      </div>
    </div>
  )
}
