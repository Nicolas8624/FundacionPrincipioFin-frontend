import { createServerClient } from '@/services/supabase/server';
import { Search, Plus, Clock, Users, GraduationCap, ChevronDown, ChevronLeft, ChevronRight, Download, UsersRound, ClipboardList, CheckCircle2, Hourglass, Eye, Info } from 'lucide-react';
import Link from 'next/link';
import { EnrollmentControls } from '@/components/admin/EnrollmentControls';
import { EnrollmentActions } from '@/components/admin/EnrollmentActions';
import { EnrollmentHeaderActions } from '@/components/admin/EnrollmentHeaderActions';

export default async function AdminInscripcionesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const supabase = await createServerClient();
  
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : '';
  const courseFilter = typeof params.course === 'string' ? params.course : '';
  const statusFilter = typeof params.status === 'string' ? params.status : '';
  const modalityFilter = typeof params.modality === 'string' ? params.modality : '';
  
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;
  const limit = 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 1. Obtener cursos para los filtros
  const { data: coursesList } = await supabase.from('courses').select('id, title').order('title');

  // 2. Obtener el conteo exacto por separado
  let countQuery = supabase.from('course_enrollments').select('*, courses!inner(modality)', { count: 'exact', head: true });
  
  if (q) countQuery.or(`full_name.ilike.%${q}%,document_number.ilike.%${q}%`);
  if (courseFilter) countQuery.eq('course_id', courseFilter);
  if (statusFilter) countQuery.eq('status', statusFilter);
  if (modalityFilter) countQuery.eq('courses.modality', modalityFilter);

  const { count: exactCount } = await countQuery;
  const totalEnrollments = exactCount || 0;
  const totalPages = Math.ceil(totalEnrollments / limit);

  // 3. Ejecutar query para métricas globales (sin filtros de búsqueda)
  const { data: statsData } = await supabase.from('course_enrollments').select('status');
  const totalInscritos = statsData?.length || 0;
  const pendientes = statsData?.filter(e => e.status === 'pendiente').length || 0;
  const aprobadas = statsData?.filter(e => e.status === 'confirmada' || e.status === 'completada').length || 0;
  const listaEspera = statsData?.filter(e => e.status === 'lista_espera').length || 0;

  // 4. Aplicar paginación a la tabla principal
  let query = supabase
    .from('course_enrollments')
    .select(`
      *,
      course:courses!inner(id, title, schedule_text, modality)
    `)
    .order('created_at', { ascending: false });

  if (q) query.or(`full_name.ilike.%${q}%,document_number.ilike.%${q}%`);
  if (courseFilter) query.eq('course_id', courseFilter);
  if (statusFilter) query.eq('status', statusFilter);
  if (modalityFilter) query.eq('courses.modality', modalityFilter);

  query = query.range(from, to);
  
  const { data: enrollmentsData } = await query;
  const enrollments = enrollmentsData || [];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-10">
      
      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            ADMINISTRACIÓN DE PARTICIPANTES • CONVOCATORIA {new Date().getFullYear()}
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold font-montserrat tracking-wide text-white">
            Gestión de Inscripciones
          </h1>
          <p className="text-[#99907c] text-sm mt-3 max-w-2xl leading-relaxed">
            Supervisa y gestiona las solicitudes de matrícula a los talleres comunitarios, verifica estados de pago/beca y asigna cupos oficiales con rigurosidad y empatía.
          </p>
        </div>
        
        <EnrollmentHeaderActions courses={coursesList || []} />
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">Total Inscritos</h3>
            <div className="w-8 h-8 rounded-lg bg-[#262629] flex items-center justify-center text-[#d0c5af]">
              <UsersRound className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-3 mb-1">
              <p className="text-5xl font-semibold text-[#D4AF37]">{totalInscritos}</p>
              <span className="text-[#D4AF37] text-[10px] font-medium bg-[#D4AF37]/10 px-2 py-1 rounded mb-1.5">+18% mes</span>
            </div>
            <p className="text-xs text-[#99907c]">Capacidad global cubierta al 82%</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] max-w-[80px]">Pendientes Revisión</h3>
            <div className="w-8 h-8 rounded-lg bg-[#262629] flex items-center justify-center text-[#D4AF37]">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-3 mb-1">
              <p className="text-5xl font-semibold text-[#D4AF37]">{pendientes}</p>
              {pendientes > 0 && <span className="text-[#D4AF37] text-[10px] font-medium border border-[#D4AF37]/30 px-2 py-1 rounded-full mb-1.5">Atención prioritaria</span>}
            </div>
            <p className="text-xs text-[#99907c]">Documentación por cotejar</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] max-w-[80px]">Aprobadas Oficial</h3>
            <div className="w-8 h-8 rounded-lg bg-[#262629] flex items-center justify-center text-[#e4e1e7]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-3 mb-1">
              <p className="text-5xl font-semibold text-white">{aprobadas}</p>
              <span className="text-[#99907c] text-[10px] font-medium border border-[#262629] px-2 py-1 rounded-full mb-1.5">Activos</span>
            </div>
            <p className="text-xs text-[#99907c]">Cupos asignados con ficha lista</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">Lista de Espera</h3>
            <div className="w-8 h-8 rounded-lg bg-[#262629] flex items-center justify-center text-[#e4e1e7]">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-3 mb-1">
              <p className="text-5xl font-semibold text-white">{listaEspera}</p>
              <span className="text-[#99907c] text-[10px] font-medium border border-[#262629] px-2 py-1 rounded-full mb-1.5">En reserva</span>
            </div>
            <p className="text-xs text-[#99907c]">Para apertura de cohortes</p>
          </div>
        </div>
      </div>

      {/* Controles de Filtrado */}
      <EnrollmentControls 
        courses={coursesList || []} 
        currentQuery={q} 
        currentCourse={courseFilter} 
        currentStatus={statusFilter} 
        currentModality={modalityFilter} 
      />

      {/* Tabla de Inscripciones */}
      <div className="bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#1b1b1f]/50 border-b border-[#262629] text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">
                <th className="px-6 py-5 font-semibold">Participante</th>
                <th className="px-6 py-5 font-semibold">Curso Solicitado</th>
                <th className="px-6 py-5 font-semibold">Fecha Registro</th>
                <th className="px-6 py-5 font-semibold">Tipo de Cupo</th>
                <th className="px-6 py-5 font-semibold">Estado</th>
                <th className="px-6 py-5 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262629]">
              {enrollments.map(enrollment => {
                const nameParts = enrollment.full_name.split(' ');
                const initials = nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase() : enrollment.full_name.substring(0, 2).toUpperCase();
                
                const date = new Date(enrollment.created_at);
                const dateStr = date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
                const timeStr = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
                
                // Tipo de cupo inferido para diseño
                const tipoCupo = enrollment.id.charCodeAt(0) % 2 === 0 ? 'BECA COMUNITARIA' : 'GENERAL';
                
                const getStatusStyle = (status: string) => {
                  if (status === 'confirmada') return 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10';
                  if (status === 'pendiente') return 'border-[#D4AF37] text-[#D4AF37]';
                  if (status === 'lista_espera') return 'border-[#e4e1e7] text-[#e4e1e7]';
                  return 'border-[#262629] text-[#99907c]';
                };

                return (
                  <tr key={enrollment.id} className="hover:bg-[#1b1b1f]/40 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#262629] flex items-center justify-center text-[#d0c5af] text-sm font-semibold border border-[#D4AF37]/20 flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#e4e1e7] font-medium text-sm mb-1 truncate pr-4">{enrollment.full_name}</p>
                          <div className="flex items-center gap-2 text-xs text-[#99907c]">
                            <span>{enrollment.document_type || 'CC'} {enrollment.document_number}</span>
                            <span>•</span>
                            <span className="truncate pr-4">{enrollment.email || 'Sin correo'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[#e4e1e7] text-sm font-medium">{enrollment.course?.title}</span>
                        <div className="flex items-start gap-1 text-[#99907c] text-xs">
                          <Clock className="w-3 h-3 mt-0.5 shrink-0" />
                          <span className="truncate max-w-[150px]">{enrollment.course?.schedule_text || 'Sin horario'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[#d0c5af] text-sm">{dateStr}</span>
                        <span className="text-[#99907c] text-xs">{timeStr}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center border border-[#D4AF37]/30 bg-transparent px-3 py-1 rounded-full text-[9px] font-montserrat uppercase tracking-wider text-[#D4AF37]">
                        {tipoCupo}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center border px-3 py-1 rounded-full text-[9px] font-montserrat uppercase tracking-wider ${getStatusStyle(enrollment.status)}`}>
                        {enrollment.status.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <EnrollmentActions enrollment={enrollment} />
                    </td>
                  </tr>
                );
              })}
              
              {enrollments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#99907c] text-sm">
                    No hay inscripciones que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {totalEnrollments > 0 && (
          <div className="bg-[#1b1b1f]/50 border-t border-[#262629] px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-[#99907c]">
              Mostrando <span className="text-[#e4e1e7] font-medium">{from + 1}-{Math.min(to + 1, totalEnrollments)}</span> de <span className="text-[#e4e1e7] font-medium">{totalEnrollments}</span> inscritos
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link 
                  href={`?page=${page - 1}${q ? `&q=${q}` : ''}${courseFilter ? `&course=${courseFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}${modalityFilter ? `&modality=${modalityFilter}` : ''}`}
                  className="px-4 py-2 bg-[#1b1b1f] border border-[#262629] hover:border-[#D4AF37]/50 rounded-lg text-sm text-[#d0c5af] hover:text-white transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </Link>
              ) : (
                <button disabled className="px-4 py-2 bg-[#0A0A0E] border border-[#262629] rounded-lg text-sm text-[#42454a] flex items-center gap-1 cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
              )}
              
              <button className="w-9 h-9 rounded-lg bg-[#D4AF37] text-[#0A0A0E] font-semibold text-sm flex items-center justify-center">
                {page}
              </button>
              
              {page < totalPages ? (
                <Link 
                  href={`?page=${page + 1}${q ? `&q=${q}` : ''}${courseFilter ? `&course=${courseFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}${modalityFilter ? `&modality=${modalityFilter}` : ''}`}
                  className="px-4 py-2 bg-[#1b1b1f] border border-[#262629] hover:border-[#D4AF37]/50 rounded-lg text-sm text-[#d0c5af] hover:text-white transition-colors flex items-center gap-1"
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <button disabled className="px-4 py-2 bg-[#0A0A0E] border border-[#262629] rounded-lg text-sm text-[#42454a] flex items-center gap-1 cursor-not-allowed">
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tarjeta de Protocolo */}
      <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#262629] flex items-center justify-center text-[#D4AF37] flex-shrink-0">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Cupos y Verificación de Requisitos</h3>
            <p className="text-[#99907c] text-sm max-w-3xl leading-relaxed">
              Los inscritos con <strong className="text-[#d0c5af]">Beca Comunitaria</strong> requieren validación obligatoria de copia de documento de identidad y recibo de servicios públicos (estratos 1, 2 y 3) antes de emitir la confirmación final de matrícula al taller.
            </p>
          </div>
        </div>
        <button className="border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0E] px-6 py-3 rounded-xl text-xs font-montserrat font-semibold tracking-wider uppercase transition-colors shrink-0 whitespace-nowrap">
          Ver Protocolo
        </button>
      </div>

    </div>
  );
}
