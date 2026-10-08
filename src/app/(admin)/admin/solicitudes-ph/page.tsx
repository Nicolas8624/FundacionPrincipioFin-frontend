import { Search, Filter, CheckCircle, Clock, Building } from 'lucide-react';

export default function AdminSolicitudesPHPage() {
  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            Alianzas Estratégicas
          </p>
          <h1 className="text-4xl font-semibold font-montserrat tracking-wide text-white">
            Solicitudes de Propiedad Horizontal
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#99907c]" />
            <input 
              type="text" 
              placeholder="Buscar conjunto..." 
              className="bg-[#1b1b1f] border border-[#262629] pl-10 pr-4 py-2.5 rounded-lg text-[#e4e1e7] text-sm focus:outline-none focus:border-[#D4AF37] transition-colors w-72"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#1b1b1f] border border-[#262629] hover:border-[#D4AF37] text-[#d0c5af] px-4 py-2.5 rounded-lg text-sm transition-colors">
            <Filter className="w-4 h-4" />
            Estado
          </button>
        </div>
      </div>

      {/* Tarjetas de estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#D4AF37]/10 to-transparent flex items-center justify-end pr-6">
            <Clock className="w-8 h-8 text-[#D4AF37]/40" />
          </div>
          <p className="text-[10px] font-montserrat uppercase tracking-widest text-[#D4AF37] mb-2">Pendientes</p>
          <p className="text-4xl font-semibold text-[#e4e1e7]">5</p>
        </div>
        <div className="p-6 bg-[#17171a] border border-[#262629] rounded-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#e4e1e7]/5 to-transparent flex items-center justify-end pr-6">
            <Search className="w-8 h-8 text-[#e4e1e7]/20" />
          </div>
          <p className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-2">En Revisión</p>
          <p className="text-4xl font-semibold text-[#e4e1e7]">2</p>
        </div>
        <div className="p-6 bg-[#17171a] border border-[#262629] rounded-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#D4AF37]/10 to-transparent flex items-center justify-end pr-6">
            <CheckCircle className="w-8 h-8 text-[#D4AF37]/20" />
          </div>
          <p className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-2">Aprobadas (Activas)</p>
          <p className="text-4xl font-semibold text-[#e4e1e7]">18</p>
        </div>
      </div>

      {/* Lista detallada */}
      <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-8">
        <div className="grid grid-cols-1 gap-4">
          
          <PHCard 
            name="Agrupación Residencial Bosques del Sur"
            address="Calle 145 # 92-15, Suba"
            units="180 apartamentos"
            admin="Diana Marcela Vega"
            phone="320 456 7890"
            date="14 Mar 2026"
            status="PENDIENTE"
          />

          <PHCard 
            name="Torres de Castilla Real II"
            address="Carrera 86 # 8-24, Kennedy"
            units="240 apartamentos"
            admin="Argenis Beltrán"
            phone="311 987 6543"
            date="13 Mar 2026"
            status="EN REVISIÓN"
          />

          <PHCard 
            name="Conjunto Sendero de los Sauces"
            address="Calle 170 # 15-20, Usaquén"
            units="96 casas"
            admin="Mauricio Gómez"
            phone="315 234 5678"
            date="12 Mar 2026"
            status="APROBADA"
          />

        </div>
      </div>
    </div>
  );
}

function PHCard({ name, address, units, admin, phone, date, status }: any) {
  const getStatusStyle = (s: string) => {
    if (s === 'PENDIENTE') return 'border-[#D4AF37] text-[#D4AF37]';
    if (s === 'EN REVISIÓN') return 'border-[#e4e1e7] text-[#e4e1e7]';
    if (s === 'APROBADA') return 'bg-[#D4AF37] text-[#0A0A0E] border-[#D4AF37]';
    return '';
  }

  return (
    <div className="bg-[#1b1b1f] border border-[#262629] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#D4AF37]/50 transition-colors">
      <div className="flex items-start gap-4 flex-1">
        <div className="w-12 h-12 rounded-xl bg-[#262629] flex items-center justify-center text-[#D4AF37] flex-shrink-0">
          <Building className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#e4e1e7] mb-1">{name}</h3>
          <p className="text-sm text-[#99907c] mb-2">{address} • {units}</p>
          <div className="flex gap-4 text-xs text-[#d0c5af]">
            <span><strong className="text-[#e4e1e7] font-medium">Admin:</strong> {admin}</span>
            <span><strong className="text-[#e4e1e7] font-medium">Tel:</strong> {phone}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 md:w-[350px] justify-between">
        <div className="text-right flex-1">
          <p className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-1">Fecha de Solicitud</p>
          <p className="text-sm text-[#e4e1e7]">{date}</p>
        </div>
        <div className="w-[120px] text-center">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border inline-block ${getStatusStyle(status)}`}>
            {status}
          </span>
        </div>
        <div>
          <button className="bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0E] px-4 py-2 rounded-lg text-xs font-semibold transition-colors">
            REVISAR
          </button>
        </div>
      </div>
    </div>
  )
}
