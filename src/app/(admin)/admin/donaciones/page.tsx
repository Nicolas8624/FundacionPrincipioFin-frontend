import { Search, Filter, Download, ArrowUpRight, DollarSign, Heart } from 'lucide-react';

export default function AdminDonacionesPage() {
  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            Financiamiento
          </p>
          <h1 className="text-4xl font-semibold font-montserrat tracking-wide text-white">
            Donaciones y Alianzas
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-[#1b1b1f] border border-[#262629] hover:border-[#D4AF37] text-[#d0c5af] px-4 py-2.5 rounded-lg text-sm transition-colors">
            <Filter className="w-4 h-4" />
            Este Mes
          </button>
          <button className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#e1c469] text-[#0A0A0E] px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors uppercase tracking-wider font-montserrat">
            <Download className="w-4 h-4" />
            Descargar Reporte
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#17171a] border border-[#262629] p-8 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-[#D4AF37] text-xs font-medium bg-[#D4AF37]/10 px-2 py-1 rounded-md">
              <ArrowUpRight className="w-3 h-3" /> +24%
            </span>
          </div>
          <p className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-1">Total Recaudado (Mes)</p>
          <p className="text-3xl font-semibold text-[#e4e1e7]">$14,850,000 <span className="text-sm font-normal text-[#99907c]">COP</span></p>
        </div>

        <div className="bg-[#17171a] border border-[#262629] p-8 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#e4e1e7]/10 flex items-center justify-center text-[#e4e1e7]">
              <Heart className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-1">Donantes Activos</p>
          <p className="text-3xl font-semibold text-[#e4e1e7]">156</p>
        </div>

        <div className="bg-[#17171a] border border-[#262629] p-8 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
              <Heart className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-1">Alianzas Corporativas</p>
          <p className="text-3xl font-semibold text-[#e4e1e7]">12</p>
        </div>
      </div>

      {/* Historial de Transacciones */}
      <div className="p-8 rounded-2xl bg-[#17171a] border border-[#262629]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#e4e1e7]">Historial de Transacciones</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#99907c]" />
            <input 
              type="text" 
              placeholder="Buscar donante o referencia..." 
              className="bg-[#1b1b1f] border border-[#262629] pl-10 pr-4 py-2 rounded-lg text-[#e4e1e7] text-sm focus:outline-none focus:border-[#D4AF37] transition-colors w-64"
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#262629] text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">
                <th className="pb-4 font-semibold">Donante / Empresa</th>
                <th className="pb-4 font-semibold">Fecha</th>
                <th className="pb-4 font-semibold">Método</th>
                <th className="pb-4 font-semibold">Estado</th>
                <th className="pb-4 font-semibold text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <TransactionRow 
                name="Distribuidora Andina SAS"
                date="15 Mar 2026, 14:30"
                method="Transferencia Bancaria"
                status="COMPLETADO"
                amount="$5,000,000 COP"
              />
              <TransactionRow 
                name="Anónimo"
                date="15 Mar 2026, 09:15"
                method="Tarjeta de Crédito (PSE)"
                status="COMPLETADO"
                amount="$50,000 COP"
              />
              <TransactionRow 
                name="Fundación Semillas de Paz"
                date="14 Mar 2026, 16:45"
                method="Cheque Gerencia"
                status="EN TRÁNSITO"
                amount="$2,500,000 COP"
              />
              <TransactionRow 
                name="Carlos Ruiz"
                date="12 Mar 2026, 11:20"
                method="Efectivo (Sede)"
                status="COMPLETADO"
                amount="$100,000 COP"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ name, date, method, status, amount }: any) {
  const getStatusStyle = (s: string) => {
    if (s === 'EN TRÁNSITO') return 'border-[#e4e1e7] text-[#e4e1e7]';
    if (s === 'COMPLETADO') return 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30';
    return '';
  }

  return (
    <tr className="border-b border-[#262629] hover:bg-[#1b1b1f] transition-colors">
      <td className="py-4">
        <p className="text-[#e4e1e7] font-medium">{name}</p>
      </td>
      <td className="py-4 text-[#99907c] text-xs">{date}</td>
      <td className="py-4 text-[#d0c5af] text-xs">{method}</td>
      <td className="py-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border inline-block ${getStatusStyle(status)}`}>
          {status}
        </span>
      </td>
      <td className="py-4 text-right">
        <p className="text-[#D4AF37] font-semibold">{amount}</p>
      </td>
    </tr>
  );
}
