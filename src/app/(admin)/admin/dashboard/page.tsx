import { createServerClient } from '@/services/supabase/server';
import { Calendar, TrendingUp, Building, HeartHandshake, Eye, MoreHorizontal, MessageSquare, BookOpen } from 'lucide-react';
import { DashboardChart } from '@/components/admin/DashboardChart';
import { ExportDashboardButton } from '@/components/admin/ExportDashboardButton';
import { connection } from 'next/server';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  await connection();
  const supabase = await createServerClient();
  const currentDate = new Date();

  // 1. Inscripciones del mes actual y mes anterior
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

  const { count: inscripcionesMes } = await supabase
    .from('course_enrollments')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString());
    
  const { count: inscripcionesMesAnterior } = await supabase
    .from('course_enrollments')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfLastMonth.toISOString())
    .lt('created_at', startOfMonth.toISOString());

  const currentMonthCount = inscripcionesMes || 0;
  const lastMonthCount = inscripcionesMesAnterior || 0;
  let porcentajeCrecimiento = 0;
  if (lastMonthCount === 0 && currentMonthCount > 0) porcentajeCrecimiento = 100;
  else if (lastMonthCount > 0) porcentajeCrecimiento = Math.round(((currentMonthCount - lastMonthCount) / lastMonthCount) * 100);

  // 2. Cursos activos (publicados) y sedes
  const { data: cursosData } = await supabase
    .from('courses')
    .select('location')
    .eq('status', 'publicado');
    
  const cursosActivos = cursosData?.length || 0;
  const sedesActivas = new Set(cursosData?.map(c => c.location).filter(Boolean)).size;

  // 3. Solicitudes PH pendientes
  const { count: phPendientes } = await supabase
    .from('ph_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pendiente');

  // 4. Donaciones recibidas (concretadas) este mes y total de alianzas
  const { data: donacionesData } = await supabase
    .from('donation_requests')
    .select('amount_cop, created_at')
    .eq('status', 'concretada');
  
  const donacionesCount = donacionesData?.length || 0;
  const totalDonacionesEsteMes = donacionesData?.filter(d => new Date(d.created_at) >= startOfMonth).reduce((acc, row) => acc + (row.amount_cop || 0), 0) || 0;

  // 5. Últimos mensajes y mensajes nuevos
  const { data: mensajes } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);

  const { count: mensajesNuevos } = await supabase
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'nuevo');

  // 6. Últimas solicitudes PH y total
  const { data: solicitudesPh } = await supabase
    .from('ph_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  const { count: totalSolicitudesPh } = await supabase
    .from('ph_requests')
    .select('*', { count: 'exact', head: true });

  // 7. Datos de la gráfica (últimos 6 meses)
  const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);
  const { data: recentEnrollments } = await supabase
    .from('course_enrollments')
    .select('created_at')
    .gte('created_at', sixMonthsAgo.toISOString());

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const chartData = [];
  let totalSeisMeses = 0;
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const mName = monthNames[d.getMonth()];
    const count = recentEnrollments?.filter(e => {
      const eDate = new Date(e.created_at);
      return eDate.getMonth() === d.getMonth() && eDate.getFullYear() === d.getFullYear();
    }).length || 0;
    
    chartData.push({ month: mName, value: count });
    totalSeisMeses += count;
  }
  
  const maxValue = Math.max(...chartData.map(d => d.value));
  const promedioMensual = (totalSeisMeses / 6).toFixed(1);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M COP`;
    return `$${val.toLocaleString('es-CO')} COP`;
  };

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
          <div className="flex items-center gap-2 bg-[#1b1b1f]/80 backdrop-blur-md border border-[#262629] px-4 py-2.5 rounded-lg text-[#d0c5af] text-sm">
            <Calendar className="w-4 h-4" />
            <span className="capitalize">Ciclo Actual: {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
          </div>
          <ExportDashboardButton />
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* Metric 1 */}
        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <div className="w-10 h-10 rounded-xl bg-[#262629] flex items-center justify-center text-[#D4AF37]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-4 max-w-[120px]">
            Inscripciones del mes
          </h3>
          <div className="flex items-end gap-3 mb-2">
            <p className="text-5xl font-semibold text-[#D4AF37]">{currentMonthCount}</p>
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md mb-1.5 ${porcentajeCrecimiento >= 0 ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#ffb4ab] bg-[#93000a]/20'}`}>
              <TrendingUp className={`w-3 h-3 ${porcentajeCrecimiento < 0 ? 'rotate-180' : ''}`} /> 
              {porcentajeCrecimiento > 0 ? '+' : ''}{porcentajeCrecimiento}%
            </span>
          </div>
          <p className="text-xs text-[#99907c]">Respecto al mes anterior</p>
        </div>

        {/* Metric 2 */}
        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <div className="w-10 h-10 rounded-xl bg-[#262629] flex items-center justify-center text-[#D4AF37]">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-4 max-w-[120px]">
            Cursos activos
          </h3>
          <div className="flex items-end gap-2 mb-2">
            <p className="text-5xl font-semibold text-[#D4AF37]">{cursosActivos}</p>
            <span className="text-[#e4e1e7] text-xs font-medium mb-1.5">EN CURSO</span>
          </div>
          <p className="text-xs text-[#99907c]">{sedesActivas} sedes y salones comunales</p>
        </div>

        {/* Metric 3 */}
        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <div className="w-10 h-10 rounded-xl bg-[#262629] flex items-center justify-center text-[#D4AF37]">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-4 max-w-[150px]">
            Solicitudes PH pendientes
          </h3>
          <div className="flex items-end gap-3 mb-2">
            <p className="text-5xl font-semibold text-[#D4AF37]">{phPendientes}</p>
            {(phPendientes ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-[#ffb4ab] text-xs font-medium bg-[#93000a]/20 px-2 py-1 rounded-md mb-1.5">
                Prioritarias
              </span>
            )}
          </div>
          <p className="text-xs text-[#99907c]">Requieren revisión técnica</p>
        </div>

        {/* Metric 4 */}
        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <div className="w-10 h-10 rounded-xl bg-[#262629] flex items-center justify-center text-[#D4AF37]">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-4 max-w-[120px]">
            Donaciones recibidas
          </h3>
          <div className="flex items-end gap-2 mb-2">
            <p className="text-5xl font-semibold text-[#D4AF37]">{donacionesCount}</p>
            <span className="text-[#e4e1e7] text-xs font-medium mb-1.5">Alianzas</span>
          </div>
          <p className="text-xs text-[#99907c]">{formatCurrency(totalDonacionesEsteMes)} captados este mes</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart Area */}
        <div className="lg:col-span-2 p-8 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] relative min-h-[400px] flex flex-col shadow-2xl">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#99907c] mb-2">
                Tendencia Semestral
              </p>
              <h2 className="text-xl font-semibold text-white">Inscripciones por mes</h2>
            </div>
            <div className="flex items-center gap-2 text-[#99907c] text-sm">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
              Ciclo {currentDate.getFullYear() - 1} - {currentDate.getFullYear()}
            </div>
          </div>
          
          <div className="flex-1 w-full relative">
            <DashboardChart data={chartData} maxValue={maxValue} />
            {maxValue > 0 && (
              <div className="absolute top-0 right-4 bg-[#0A0A0E]/80 border border-[#D4AF37] text-[#D4AF37] px-3 py-1.5 rounded-md text-xs font-semibold z-10">
                Pico Histórico: {maxValue} Alumnos
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-6 text-sm text-[#99907c]">
              <p>Promedio: <span className="text-[#e4e1e7] font-medium">{promedioMensual} inscripciones/mes</span></p>
              <p>Tasa de retención: <span className="text-[#D4AF37] font-medium">100%</span></p>
            </div>
            <Link href="/admin/cursos" className="text-[#D4AF37] text-xs font-montserrat font-semibold tracking-wider uppercase hover:text-[#F5D77A] transition-colors">
              Ver cursos →
            </Link>
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
            {mensajesNuevos !== null && mensajesNuevos > 0 && (
              <div className="bg-[#2a2417] text-[#D4AF37] text-[10px] px-2 py-1 rounded font-semibold border border-[#D4AF37]/30">
                {mensajesNuevos} Nuevos
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            {mensajes?.length ? mensajes.map(msg => {
              const nameParts = msg.name.split(' ');
              const initials = nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase() : msg.name.substring(0, 2).toUpperCase();
              
              const date = new Date(msg.created_at);
              const isToday = new Date().toDateString() === date.toDateString();
              const timeString = isToday 
                ? `Hoy, ${date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`
                : date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });

              return (
                <MessageItem 
                  key={msg.id}
                  initials={initials} 
                  name={msg.name} 
                  time={timeString} 
                  subject={msg.subject || 'Contacto'} 
                />
              )
            }) : (
              <p className="text-sm text-[#99907c] text-center pt-8">No hay mensajes recientes.</p>
            )}
          </div>

          <Link href="/admin/mensajes" className="w-full block mt-6 text-[#D4AF37] text-xs font-montserrat font-semibold tracking-wider uppercase hover:text-[#F5D77A] text-center pt-4 border-t border-[#262629] transition-colors">
            Gestionar todos los mensajes →
          </Link>
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
             <button className="bg-[#1b1b1f] border border-[#262629] px-4 py-2 rounded-lg text-[#d0c5af] text-sm hover:text-white transition-colors">
                Filtrar estado
             </button>
             <Link href="/admin/solicitudes-ph" className="text-[#D4AF37] text-xs font-montserrat font-semibold tracking-wider uppercase hover:text-[#F5D77A] flex items-center transition-colors">
                Ver Todas ({totalSolicitudesPh || 0})
             </Link>
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
              {solicitudesPh?.length ? solicitudesPh.map(req => {
                const date = new Date(req.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
                return (
                  <TableRow 
                    key={req.id}
                    icon={<Building className={`w-4 h-4 ${req.status === 'pendiente' ? 'text-[#D4AF37]' : 'text-[#e4e1e7]'}`} />}
                    name={req.complex_name}
                    details={`${req.locality || 'Sin localidad'} · ${req.residents_count || '?'} aptos`}
                    admin={req.administrator_name}
                    date={date}
                    status={req.status.toUpperCase().replace('_', ' ')}
                  />
                )
              }) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-[#99907c]">
                    No hay solicitudes recientes.
                  </td>
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
function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

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
    return '';
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
