import { Download, HeartHandshake } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

function formatDateSpanish(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function AdminDonacionesPage() {
  const supabase = await createClient();

  const { data: donations } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            Gestión de Recursos
          </p>
          <h1 className="text-4xl font-semibold font-montserrat tracking-wide text-white">
            Intenciones de Donación
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#e1c469] text-[#0A0A0E] px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors uppercase tracking-wider font-montserrat">
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="p-8 bg-space-card/60 backdrop-blur-md border border-space-border/80 text-white rounded-2xl">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-space-border/80 text-[10px] font-montserrat uppercase tracking-widest text-gray-400">
                <th className="pb-4 font-semibold">Donante</th>
                <th className="pb-4 font-semibold">Tipo de Aporte</th>
                <th className="pb-4 font-semibold">Detalle / Monto</th>
                <th className="pb-4 font-semibold">Fecha</th>
                <th className="pb-4 font-semibold">Estado</th>
                <th className="pb-4 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {donations && donations.length > 0 ? (
                donations.map((don: any) => (
                  <TableRow 
                    key={don.id}
                    icon={<HeartHandshake className="w-4 h-4 text-gold-primary" />}
                    name={don.full_name || 'Anónimo'}
                    email={don.email || ''}
                    type={don.donation_type || 'Desconocido'}
                    amount={don.amount_or_description || 'No especificado'}
                    date={formatDateSpanish(don.created_at)}
                    status={don.status || 'PENDIENTE'}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-400">No hay donaciones registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TableRow({ icon, name, email, type, amount, date, status }: any) {
  const getStatusStyle = (s: string) => {
    if (s === 'PENDIENTE') return 'border-gold-primary text-gold-primary';
    if (s === 'GESTIONADA') return 'bg-gold-primary text-space-dark border-gold-primary';
    return 'border-gray-400 text-gray-400';
  }

  return (
    <tr className="border-b border-space-border/50 hover:bg-space-card/80 transition-colors group">
      <td className="py-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-space-black border border-space-border/50 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <p className="text-white font-medium mb-1">{name}</p>
            <p className="text-gray-400 text-xs">{email}</p>
          </div>
        </div>
      </td>
      <td className="py-4 text-gray-300">
        <span className="bg-space-black px-3 py-1 rounded-md text-xs border border-space-border/50 capitalize">
            {type}
        </span>
      </td>
      <td className="py-4 text-gray-300 text-xs truncate max-w-[200px]">{amount}</td>
      <td className="py-4 text-gray-400 text-xs">{date}</td>
      <td className="py-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${getStatusStyle(status)}`}>
          {status}
        </span>
      </td>
      <td className="py-4 text-right">
        <button className="text-gold-primary hover:text-gold-light text-xs font-semibold tracking-wider transition-colors">
          GESTIONAR
        </button>
      </td>
    </tr>
  );
}
