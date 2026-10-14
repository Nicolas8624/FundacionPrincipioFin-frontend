import { createServerClient } from '@/services/supabase/server';
import { Calendar, TrendingUp, Building, HeartHandshake, Eye, MoreHorizontal, MessageSquare, BookOpen } from 'lucide-react';
import { DashboardChart } from '@/components/admin/DashboardChart';
import { ExportDashboardButton } from '@/components/admin/ExportDashboardButton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
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
    <div className="pb-10 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div className="space-y-1">
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
            Consola central de operaciones
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-montserrat tracking-tight text-white">
            Resumen General
          </h1>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1b1b1f] border border-[#262629] px-3.5 py-2.5 rounded-xl text-[#d0c5af] text-xs font-montserrat font-medium shadow-sm">
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <span className="capitalize">Ciclo: {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
          </div>
          <ExportDashboardButton />
        </div>
      </div>
      
      {/* Metrics Grid (1 col mobile, 2 col tablet, 4 col desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1 */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0A0A0E]/70 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/40 transition-all shadow-lg flex flex-col justify-between group">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] leading-tight">
              Inscripciones del mes
            </h3>
            <div className="w-10 h-10 rounded-xl bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37] shrink-0 group-hover:border-[#D4AF37]/40 transition-colors shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-3 mb-2 flex-wrap">
              <p className="text-4xl sm:text-5xl font-bold font-montserrat text-[#D4AF37] tracking-tight">{currentMonthCount}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${porcentajeCrecimiento >= 0 ? 'text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20' : 'text-[#ffb4ab] bg-[#93000a]/20 border border-[#ffb4ab]/20'}`}>
                <TrendingUp className={`w-3 h-3 ${porcentajeCrecimiento < 0 ? 'rotate-180' : ''}`} /> 
                {porcentajeCrecimiento > 0 ? '+' : ''}{porcentajeCrecimiento}%
              </span>
            </div>
            <p className="text-xs text-[#99907c]">Respecto al mes anterior</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0A0A0E]/70 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/40 transition-all shadow-lg flex flex-col justify-between group">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] leading-tight">
              Cursos activos
            </h3>
            <div className="w-10 h-10 rounded-xl bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37] shrink-0 group-hover:border-[#D4AF37]/40 transition-colors shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2.5 mb-2 flex-wrap">
              <p className="text-4xl sm:text-5xl font-bold font-montserrat text-[#D4AF37] tracking-tight">{cursosActivos}</p>
              <span className="text-[#e4e1e7] text-xs font-semibold uppercase px-2 py-0.5 rounded bg-[#1b1b1f] border border-[#262629]">En curso</span>
            </div>
            <p className="text-xs text-[#99907c]">{sedesActivas} sedes y salones comunales</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0A0A0E]/70 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/40 transition-all shadow-lg flex flex-col justify-between group">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] leading-tight">
              Solicitudes PH pendientes
            </h3>
            <div className="w-10 h-10 rounded-xl bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37] shrink-0 group-hover:border-[#D4AF37]/40 transition-colors shadow-inner">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-3 mb-2 flex-wrap">
              <p className="text-4xl sm:text-5xl font-bold font-montserrat text-[#D4AF37] tracking-tight">{phPendientes}</p>
              {(phPendientes ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1 text-[#ffb4ab] text-xs font-semibold bg-[#93000a]/20 border border-[#ffb4ab]/20 px-2 py-0.5 rounded-md">
                  Prioritarias
                </span>
              )}
            </div>
            <p className="text-xs text-[#99907c]">Requieren revisión técnica</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0A0A0E]/70 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/40 transition-all shadow-lg flex flex-col justify-between group">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] leading-tight">
              Donaciones recibidas
            </h3>
            <div className="w-10 h-10 rounded-xl bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37] shrink-0 group-hover:border-[#D4AF37]/40 transition-colors shadow-inner">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2.5 mb-2 flex-wrap">
              <p className="text-4xl sm:text-5xl font-bold font-montserrat text-[#D4AF37] tracking-tight">{donacionesCount}</p>
              <span className="text-[#e4e1e7] text-xs font-semibold uppercase px-2 py-0.5 rounded bg-[#1b1b1f] border border-[#262629]">Alianzas</span>
            </div>
            <p className="text-xs text-[#99907c] truncate" title={`${formatCurrency(totalDonacionesEsteMes)} captados este mes`}>
              {formatCurrency(totalDonacionesEsteMes)} este mes
            </p>
          </div>
        </div>

      </div>

      {/* Charts & Messages Grid (Stacked on mobile/tablet, 2-1 on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 p-5 sm:p-6 lg:p-8 rounded-2xl bg-[#0A0A0E]/70 backdrop-blur-xl border border-[#262629] relative min-h-[380px] sm:min-h-[420px] flex flex-col justify-between shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 mb-4">
            <div>
              <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#99907c] mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                Tendencia Semestral
              </p>
              <h2 className="text-lg sm:text-xl font-bold font-montserrat text-white">Inscripciones por mes</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-montserrat text-[#99907c] bg-[#1b1b1f] px-3 py-1.5 rounded-lg border border-[#262629] self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
              Ciclo {currentDate.getFullYear() - 1} - {currentDate.getFullYear()}
            </div>
          </div>
          
          <div className="flex-1 w-full relative min-h-[220px]">
            <DashboardChart data={chartData} maxValue={maxValue} />
            {maxValue > 0 && (
              <div className="hidden sm:inline-flex absolute top-0 right-4 bg-[#0A0A0E]/90 border border-[#D4AF37]/60 text-[#D4AF37] px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md">
                Pico Histórico: {maxValue} Alumnos
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mt-6 pt-4 border-t border-[#262629]">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-[#99907c]">
              <p>Promedio: <strong className="text-[#e4e1e7] font-semibold">{promedioMensual} inscripciones/mes</strong></p>
              <p>Tasa de retención: <strong className="text-[#D4AF37] font-semibold">100%</strong></p>
            </div>
            <Link 
              href="/admin/cursos" 
              className="text-[#D4AF37] text-xs font-montserrat font-bold tracking-wider uppercase hover:text-[#ffe082] transition-colors inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Ver cursos</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="p-5 sm:p-6 lg:p-8 rounded-2xl bg-[#0A0A0E]/70 backdrop-blur-xl border border-[#262629] flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#99907c] mb-1.5">
                  Bandeja de entrada
                </p>
                <h2 className="text-lg sm:text-xl font-bold font-montserrat text-white">Últimos mensajes</h2>
              </div>
              {mensajesNuevos !== null && mensajesNuevos > 0 && (
                <div className="bg-[#D4AF37]/15 text-[#D4AF37] text-[10px] px-2.5 py-1 rounded-full font-bold font-montserrat uppercase border border-[#D4AF37]/30 shrink-0">
                  {mensajesNuevos} Nuevos
                </div>
              )}
            </div>

            <div className="space-y-3">
              {mensajes?.length ? mensajes.map(msg => {
                const nameParts = (msg.name || '').trim().split(' ');
                const initials = nameParts.length > 1 
                  ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase() 
                  : (msg.name || 'NN').substring(0, 2).toUpperCase();
                
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
                );
              }) : (
                <p className="text-sm text-[#99907c] text-center py-8">No hay mensajes recientes.</p>
              )}
            </div>
          </div>

          <Link 
            href="/admin/mensajes" 
            className="w-full block mt-6 text-[#D4AF37] text-xs font-montserrat font-bold tracking-wider uppercase hover:text-[#ffe082] text-center pt-4 border-t border-[#262629] transition-colors"
          >
            Gestionar todos los mensajes →
          </Link>
        </div>
      </div>

      {/* Tables Section: Solicitudes PH */}
      <div className="p-5 sm:p-6 lg:p-8 rounded-2xl bg-[#0A0A0E]/70 backdrop-blur-xl border border-[#262629] shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#99907c] mb-1.5">
              Gestión de alianzas residenciales
            </p>
            <h2 className="text-lg sm:text-xl font-bold font-montserrat text-white">
              Últimas solicitudes de propiedad horizontal
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/admin/solicitudes-ph" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] text-[#D4AF37] hover:text-[#ffe082] border border-[#262629] text-xs font-montserrat font-semibold uppercase tracking-wider transition-all"
            >
              <span>Ver todas ({totalSolicitudesPh || 0})</span>
              <Eye className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Desktop & Tablet Table with Horizontal Scroll on small screens */}
        <div className="w-full overflow-x-auto custom-scrollbar rounded-xl border border-[#262629]">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="bg-[#1b1b1f]/60 border-b border-[#262629] text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">
                <th className="px-5 py-3.5 font-semibold">Conjunto / Edificio</th>
                <th className="px-4 py-3.5 font-semibold">Administrador(a)</th>
                <th className="px-4 py-3.5 font-semibold">Fecha</th>
                <th className="px-4 py-3.5 font-semibold">Estado</th>
                <th className="px-5 py-3.5 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[#262629]/60">
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
                );
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
function MessageItem({ initials, name, time, subject }: { initials: string; name: string; time: string; subject: string }) {
  return (
    <div className="bg-[#1b1b1f]/80 hover:bg-[#1b1b1f] p-3.5 rounded-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-all flex items-center gap-3.5">
      <div className="w-9 h-9 rounded-xl bg-[#262629] border border-[#353439] flex-shrink-0 flex items-center justify-center text-[#D4AF37] text-xs font-bold font-montserrat">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5 gap-2">
          <p className="text-[#e4e1e7] font-semibold text-xs sm:text-sm truncate">{name}</p>
          <span className="text-[#99907c] text-[10px] font-montserrat shrink-0">{time}</span>
        </div>
        <p className="text-[#99907c] text-xs truncate">
          Asunto: <span className="text-[#d0c5af]">&quot;{subject}&quot;</span>
        </p>
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
    if (s === 'PENDIENTE') return 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10';
    if (s === 'EN REVISIÓN') return 'border-[#e4e1e7] text-[#e4e1e7] bg-[#1b1b1f]';
    if (s === 'APROBADA') return 'bg-[#D4AF37] text-[#0A0A0E] border-[#D4AF37] font-bold';
    return 'border-[#262629] text-[#99907c]';
  };

  return (
    <tr className="hover:bg-[#1b1b1f]/50 transition-colors group">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-[#262629] border border-[#262629] group-hover:border-[#D4AF37]/30 flex items-center justify-center shrink-0 transition-colors">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-[#e4e1e7] font-semibold text-sm mb-0.5 truncate max-w-[200px] sm:max-w-[280px]">{name}</p>
            <p className="text-[#99907c] text-[10px] tracking-wide truncate">{details}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-[#d0c5af] text-xs font-medium truncate max-w-[150px]">{admin}</td>
      <td className="px-4 py-3.5 text-[#99907c] text-xs whitespace-nowrap">{date}</td>
      <td className="px-4 py-3.5">
        <span className={`px-2.5 py-1 rounded-full text-[9px] font-montserrat uppercase tracking-wider border font-semibold ${getStatusStyle(status)}`}>
          {status}
        </span>
      </td>
      <td className="px-5 py-3.5 text-right">
        <Link 
          href={`/admin/solicitudes-ph?q=${encodeURIComponent(name)}`}
          className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0E] text-xs font-montserrat font-bold uppercase transition-all shadow-sm"
        >
          Ver
        </Link>
      </td>
    </tr>
  );
}
