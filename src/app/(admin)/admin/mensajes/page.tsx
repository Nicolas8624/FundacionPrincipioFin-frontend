import { Download, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

function formatDateSpanish(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function AdminMensajesPage() {
  const supabase = await createClient();

  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            Centro de Comunicaciones
          </p>
          <h1 className="text-4xl font-semibold font-montserrat tracking-wide text-white">
            Mensajes de Contacto
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
                <th className="pb-4 font-semibold">Remitente</th>
                <th className="pb-4 font-semibold">Contacto</th>
                <th className="pb-4 font-semibold">Asunto</th>
                <th className="pb-4 font-semibold">Fecha</th>
                <th className="pb-4 font-semibold">Estado</th>
                <th className="pb-4 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {messages && messages.length > 0 ? (
                messages.map((msg: any) => (
                  <TableRow 
                    key={msg.id}
                    icon={<MessageSquare className="w-4 h-4 text-gold-primary" />}
                    name={msg.full_name || 'Desconocido'}
                    phone={msg.phone || ''}
                    email={msg.email || ''}
                    subject={msg.subject || 'Sin Asunto'}
                    date={formatDateSpanish(msg.created_at)}
                    status={msg.status || 'NO LEÍDO'}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-400">No hay mensajes registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TableRow({ icon, name, phone, email, subject, date, status }: any) {
  const getStatusStyle = (s: string) => {
    if (s === 'NO LEÍDO') return 'border-gold-primary text-gold-primary';
    if (s === 'RESPONDIDO') return 'bg-gold-primary text-space-dark border-gold-primary';
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
          </div>
        </div>
      </td>
      <td className="py-4 text-gray-400 text-xs">
        <p>{email}</p>
        <p>{phone}</p>
      </td>
      <td className="py-4 text-gray-300 font-medium">{subject}</td>
      <td className="py-4 text-gray-400 text-xs">{date}</td>
      <td className="py-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${getStatusStyle(status)}`}>
          {status}
        </span>
      </td>
      <td className="py-4 text-right">
        <button className="text-gold-primary hover:text-gold-light text-xs font-semibold tracking-wider transition-colors">
          LEER
        </button>
      </td>
    </tr>
  );
}
