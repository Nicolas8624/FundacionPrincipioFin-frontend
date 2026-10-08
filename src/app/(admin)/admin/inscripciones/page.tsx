import { Search, Filter, Download, UserCheck, Clock, XCircle } from 'lucide-react';

export default function AdminInscripcionesPage() {
  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            Control Estudiantil
          </p>
          <h1 className="text-4xl font-semibold font-montserrat tracking-wide text-white">
            Inscripciones Activas
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#99907c]" />
            <input 
              type="text" 
              placeholder="Buscar alumno o documento..." 
              className="bg-[#1b1b1f] border border-[#262629] pl-10 pr-4 py-2.5 rounded-lg text-[#e4e1e7] text-sm focus:outline-none focus:border-[#D4AF37] transition-colors w-72"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#1b1b1f] border border-[#262629] hover:border-[#D4AF37] text-[#d0c5af] px-4 py-2.5 rounded-lg text-sm transition-colors">
            <Filter className="w-4 h-4" />
            Estado
          </button>
          <button className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#e1c469] text-[#0A0A0E] px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors uppercase tracking-wider font-montserrat">
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#17171a] border border-[#262629] p-6 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-[#e4e1e7]">124</p>
            <p className="text-xs text-[#99907c] uppercase tracking-wider font-montserrat mt-1">Pendientes de Pago/Doc</p>
          </div>
        </div>
        <div className="bg-[#17171a] border border-[#262629] p-6 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#4ade80]/10 flex items-center justify-center text-[#4ade80]">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-[#e4e1e7]">892</p>
            <p className="text-xs text-[#99907c] uppercase tracking-wider font-montserrat mt-1">Inscripciones Confirmadas</p>
          </div>
        </div>
        <div className="bg-[#17171a] border border-[#262629] p-6 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#f87171]/10 flex items-center justify-center text-[#f87171]">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-[#e4e1e7]">15</p>
            <p className="text-xs text-[#99907c] uppercase tracking-wider font-montserrat mt-1">Canceladas / Rechazadas</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-8 rounded-2xl bg-[#17171a] border border-[#262629]">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#262629] text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">
                <th className="pb-4 font-semibold">Estudiante</th>
                <th className="pb-4 font-semibold">Documento</th>
                <th className="pb-4 font-semibold">Curso Seleccionado</th>
                <th className="pb-4 font-semibold">Fecha</th>
                <th className="pb-4 font-semibold">Estado</th>
                <th className="pb-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <TableRow 
                name="Ana María López"
                email="ana.lopez@email.com"
                document="CC - 1023456789"
                course="Pintura y Expresión Artística"
                date="14 Mar 2026"
                status="CONFIRMADA"
              />
              <TableRow 
                name="Carlos Eduardo Reyes"
                email="carlos.reyes@email.com"
                document="TI - 1056789123"
                course="Emprendimiento Digital 101"
                date="14 Mar 2026"
                status="PENDIENTE"
              />
              <TableRow 
                name="Juliana Morales"
                email="juli.mora@email.com"
                document="CC - 52890123"
                course="Inglés Conversacional B1"
                date="13 Mar 2026"
                status="CONFIRMADA"
              />
              <TableRow 
                name="Roberto Martínez"
                email="roberto.mtz@email.com"
                document="CE - 894561"
                course="Guitarra Acústica Básica"
                date="12 Mar 2026"
                status="CANCELADA"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TableRow({ name, email, document, course, date, status }: any) {
  const getStatusStyle = (s: string) => {
    if (s === 'PENDIENTE') return 'border-[#D4AF37] text-[#D4AF37]';
    if (s === 'CANCELADA') return 'border-[#93000a] text-[#ffb4ab]';
    if (s === 'CONFIRMADA') return 'bg-[#D4AF37] text-[#0A0A0E] border-[#D4AF37]';
    return '';
  }

  return (
    <tr className="border-b border-[#262629] hover:bg-[#1b1b1f] transition-colors group">
      <td className="py-4">
        <div>
          <p className="text-[#e4e1e7] font-medium mb-1">{name}</p>
          <p className="text-[#99907c] text-xs">{email}</p>
        </div>
      </td>
      <td className="py-4 text-[#d0c5af] text-xs">{document}</td>
      <td className="py-4">
        <span className="text-[#e4e1e7] bg-[#262629] px-3 py-1 rounded-md text-xs">{course}</span>
      </td>
      <td className="py-4 text-[#99907c] text-xs">{date}</td>
      <td className="py-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${getStatusStyle(status)}`}>
          {status}
        </span>
      </td>
      <td className="py-4 text-right">
        <button className="text-[#D4AF37] hover:text-[#F5D77A] text-xs font-semibold tracking-wider transition-colors">
          Gestionar
        </button>
      </td>
    </tr>
  );
}
