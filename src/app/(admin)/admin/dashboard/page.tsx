import { Calendar, Download, TrendingUp, Building, HeartHandshake, Eye, MoreHorizontal, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

function formatDateSpanish(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch metrics
  const { count: enrollmentsCount } = await supabase.from('enrollments').select('*', { count: 'exact', head: true });
  const { count: phRequestsCount } = await supabase.from('ph_requests').select('*', { count: 'exact', head: true });
  const { count: donationsCount } = await supabase.from('donations').select('*', { count: 'exact', head: true });
  const { count: messagesCount } = await supabase.from('contact_messages').select('*', { count: 'exact', head: true });

  // Fetch recent messages
  const { data: recentMessages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);

  // Fetch recent PH requests
  const { data: recentPhRequests } = await supabase
    .from('ph_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            Consola central de operaciones
          </p>
          <h1 className="text-4xl font-semibold font-montserrat tracking-wide text-white">
            Resumen General
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#1b1b1f] border border-[#262629] px-4 py-2.5 rounded-lg text-[#d0c5af] text-sm">
            <Calendar className="w-4 h-4" />
            <span>Ciclo Actual: Marzo 2026</span>
          </div>
          <button className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#e1c469] text-[#0A0A0E] px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors uppercase tracking-wider font-montserrat">
            <Download className="w-4 h-4" />
            Exportar Informe
          </button>
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* Metric 1 */}
        <div className="p-6 rounded-2xl bg-[#17171a] border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <div className="w-10 h-10 rounded-xl bg-[#262629] flex items-center justify-center text-[#D4AF37]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-4 max-w-[120px]">
            Inscripciones Totales
          </h3>
          <div className="flex items-end gap-3 mb-2">
            <p className="text-5xl font-semibold text-[#D4AF37]">{enrollmentsCount || 0}</p>
          </div>
          <p className="text-xs text-[#99907c]">Personas registradas en talleres</p>
        </div>

        {/* Metric 2 */}
        <div className="p-6 rounded-2xl bg-[#17171a] border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <div className="w-10 h-10 rounded-xl bg-[#262629] flex items-center justify-center text-[#D4AF37]">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-4 max-w-[150px]">
            Solicitudes PH
          </h3>
          <div className="flex items-end gap-3 mb-2">
            <p className="text-5xl font-semibold text-[#D4AF37]">{phRequestsCount || 0}</p>
          </div>
          <p className="text-xs text-[#99907c]">Solicitudes de conjuntos registradas</p>
        </div>

        {/* Metric 3 */}
        <div className="p-6 rounded-2xl bg-[#17171a] border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <div className="w-10 h-10 rounded-xl bg-[#262629] flex items-center justify-center text-[#D4AF37]">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-4 max-w-[120px]">
            Donaciones Registradas
          </h3>
          <div className="flex items-end gap-2 mb-2">
            <p className="text-5xl font-semibold text-[#D4AF37]">{donationsCount || 0}</p>
          </div>
          <p className="text-xs text-[#99907c]">Intenciones de aporte captadas</p>
        </div>

        {/* Metric 4 */}
        <div className="p-6 rounded-2xl bg-[#17171a] border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <div className="w-10 h-10 rounded-xl bg-[#262629] flex items-center justify-center text-[#D4AF37]">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-4 max-w-[120px]">
            Mensajes de Contacto
          </h3>
          <div className="flex items-end gap-2 mb-2">
            <p className="text-5xl font-semibold text-[#D4AF37]">{messagesCount || 0}</p>
          </div>
          <p className="text-xs text-[#99907c]">Consultas desde el formulario de contacto</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart Area */}
        <div className="lg:col-span-2 p-8 rounded-2xl bg-[#17171a] border border-[#262629] relative min-h-[400px] flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#99907c] mb-2">
                Tendencia Semestral
              </p>
              <h2 className="text-xl font-semibold text-white">Inscripciones por mes</h2>
            </div>
            <div className="flex items-center gap-2 text-[#99907c] text-sm">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
              Ciclo 2025 - 2026
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            {/* Chart Mockup (SVG line) */}
            <div className="w-full relative h-[200px] border-b border-l border-[#262629] flex items-end justify-between px-4 pb-2">
               <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M 0,80 L 20,70 L 40,90 L 60,50 L 80,60 L 100,20" fill="none" stroke="#D4AF37" strokeWidth="2" />
                  <path d="M 0,80 L 20,70 L 40,90 L 60,50 L 80,60 L 100,20 L 100,100 L 0,100 Z" fill="url(#grad1)" opacity="0.1" />
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity="1" />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Dots */}
                  <circle cx="0" cy="80" r="2" fill="#17171a" stroke="#D4AF37" strokeWidth="1" />
                  <circle cx="20" cy="70" r="2" fill="#17171a" stroke="#D4AF37" strokeWidth="1" />
                  <circle cx="40" cy="90" r="2" fill="#17171a" stroke="#D4AF37" strokeWidth="1" />
                  <circle cx="60" cy="50" r="2" fill="#17171a" stroke="#D4AF37" strokeWidth="1" />
                  <circle cx="80" cy="60" r="2" fill="#17171a" stroke="#D4AF37" strokeWidth="1" />
                  <circle cx="100" cy="20" r="3" fill="#D4AF37" />
               </svg>
               <div className="absolute top-[10%] right-[5%] bg-[#0A0A0E] border border-[#D4AF37] text-[#D4AF37] px-3 py-1.5 rounded-md text-xs font-semibold">
                 Pico Histórico: 48 Alumnos
               </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-6 text-sm text-[#99907c]">
              <p>Promedio: <span className="text-[#e4e1e7] font-medium">36.3 inscripciones/mes</span></p>
              <p>Tasa de retención: <span className="text-[#D4AF37] font-medium">91.4%</span></p>
            </div>
            <button className="text-[#D4AF37] text-xs font-montserrat font-semibold tracking-wider uppercase hover:text-[#F5D77A]">
              Ver desglose por curso →
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="p-8 rounded-2xl bg-[#17171a] border border-[#262629] flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#99907c] mb-2">
                Bandeja de entrada
              </p>
              <h2 className="text-xl font-semibold text-white">Últimos mensajes de contacto</h2>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {recentMessages && recentMessages.length > 0 ? (
              recentMessages.map((msg: any) => (
                <MessageItem 
                  key={msg.id}
                  initials={msg.full_name?.substring(0,2).toUpperCase() || 'NA'} 
                  name={msg.full_name || 'Sin nombre'} 
                  time={formatDateSpanish(msg.created_at)} 
                  subject={msg.subject || 'Sin asunto'} 
                />
              ))
            ) : (
              <p className="text-[#99907c] text-sm">No hay mensajes recientes.</p>
            )}
          </div>

          <a href="/admin/mensajes" className="block w-full mt-6 text-[#D4AF37] text-xs font-montserrat font-semibold tracking-wider uppercase hover:text-[#F5D77A] text-center pt-4 border-t border-[#262629]">
            Gestionar todos los mensajes →
          </a>
        </div>
      </div>

      {/* Tables Section */}
      <div className="p-8 rounded-2xl bg-[#17171a] border border-[#262629]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#99907c] mb-2">
              Gestión de alianzas residenciales
            </p>
            <h2 className="text-xl font-semibold text-white">Últimas solicitudes de propiedad horizontal</h2>
          </div>
          <div className="flex gap-4">
             <a href="/admin/solicitudes-ph" className="text-[#D4AF37] text-xs font-montserrat font-semibold tracking-wider uppercase hover:text-[#F5D77A]">
                Ver Todas
             </a>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#262629] text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">
                <th className="pb-4 font-semibold">Conjunto</th>
                <th className="pb-4 font-semibold">Administrador</th>
                <th className="pb-4 font-semibold">Fecha</th>
                <th className="pb-4 font-semibold">Estado</th>
                <th className="pb-4 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentPhRequests && recentPhRequests.length > 0 ? (
                recentPhRequests.map((req: any) => (
                  <TableRow 
                    key={req.id}
                    icon={<Building className="w-4 h-4 text-[#D4AF37]" />}
                    name={req.complex_name || 'Sin nombre'}
                    details={req.location || 'Ubicación no especificada'}
                    admin={req.applicant_name || 'Sin administrador'}
                    date={formatDateSpanish(req.created_at)}
                    status={req.status || 'PENDIENTE'}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-[#99907c] text-center">No hay solicitudes recientes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Helper components for the page
function MessageItem({ initials, name, time, subject }: { initials: string, name: string, time: string, subject: string }) {
  return (
    <div className="bg-[#1b1b1f] p-4 rounded-xl border border-[#262629] flex gap-4">
      <div className="w-8 h-8 rounded-full bg-[#262629] flex-shrink-0 flex items-center justify-center text-[#99907c] text-xs font-semibold">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <p className="text-[#e4e1e7] font-medium text-sm truncate pr-2">{name}</p>
          <span className="text-[#99907c] text-[10px] whitespace-nowrap">{time}</span>
        </div>
        <p className="text-[#99907c] text-xs truncate">Asunto: &quot;{subject}&quot;</p>
      </div>
    </div>
  );
}

interface TableRowProps {
  icon: React.ReactNode;
  name: string;
  details: string;
  admin: string;
  date: string;
  status: string;
}

function TableRow({ icon, name, details, admin, date, status }: TableRowProps) {
  const getStatusStyle = (s: string) => {
    if (s === 'PENDIENTE') return 'border-[#D4AF37] text-[#D4AF37]';
    if (s === 'EN REVISIÓN') return 'border-[#e4e1e7] text-[#e4e1e7]';
    if (s === 'APROBADA') return 'bg-[#D4AF37] text-[#0A0A0E] border-[#D4AF37]';
    return 'border-[#e4e1e7] text-[#e4e1e7]';
  }

  return (
    <tr className="border-b border-[#262629] hover:bg-[#1b1b1f] transition-colors group">
      <td className="py-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#262629] flex items-center justify-center">
            {icon}
          </div>
          <div>
            <p className="text-[#e4e1e7] font-medium mb-1">{name}</p>
            <p className="text-[#99907c] text-[10px] tracking-wide">{details}</p>
          </div>
        </div>
      </td>
      <td className="py-4 text-[#d0c5af]">{admin}</td>
      <td className="py-4 text-[#d0c5af]">{date}</td>
      <td className="py-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${getStatusStyle(status)}`}>
          {status}
        </span>
      </td>
      <td className="py-4 text-right">
        <button className="border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0E] px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors">
          VER
        </button>
      </td>
    </tr>
  );
}
