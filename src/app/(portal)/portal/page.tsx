import { createServerClient } from '@/services/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, 
  Pencil, 
  Star, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Play, 
  CalendarCheck2, 
  TrendingUp,
  Megaphone,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PortalDashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Traer perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const fullName = profile?.full_name || user.user_metadata?.full_name || 'Estudiante';
  const firstName = fullName.split(' ')[0] || fullName;

  // Auto-vincular inscripciones huérfanas por email si existen
  if (user.email) {
    await supabase
      .from('course_enrollments')
      .update({ user_id: user.id })
      .is('user_id', null)
      .ilike('email', user.email);
  }

  // Traer anuncios oficiales del tablero comunitario (reales de Supabase)
  const { data: rawAnnouncements } = await supabase
    .from('announcements')
    .select('*')
    .eq('status', 'publicado')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(4);

  const announcements = rawAnnouncements || [];
  const featuredAnnouncement = announcements.length > 0 ? announcements[0] : null;
  const secondaryAnnouncements = announcements.length > 1 ? announcements.slice(1) : [];

  // Traer inscripciones reales del usuario
  const { data: enrollmentsData, error: enrollError } = await supabase
    .from('course_enrollments')
    .select(`
      id,
      course_id,
      user_id,
      full_name,
      email,
      status,
      attended_sessions,
      average_grade,
      cupo_type,
      created_at,
      course:courses (
        id,
        title,
        instructor_name,
        modality,
        schedule_text,
        location,
        image_url
      )
    `)
    .or(`user_id.eq.${user.id},email.ilike.${user.email || ''}`)
    .not('status', 'in', '("cancelada","rechazada")');

  if (enrollError) {
    console.error('Error al cargar inscripciones del usuario:', enrollError);
  }

  const enrollments = enrollmentsData || [];
  const hasRealCourses = enrollments.length > 0;

  // 1. Cursos Activos (Cálculo Real)
  const activeEnrollments = enrollments.filter(e => e.status !== 'completada' && e.status !== 'aprobada' && e.status !== 'cancelada' && e.status !== 'rechazada');
  const activeCoursesCount = activeEnrollments.length;

  // 2. Promedio de Rúbricas (Cálculo Real)
  const gradedCourses = enrollments.filter(e => e.average_grade !== null && Number(e.average_grade) > 0);
  const averageGrade = gradedCourses.length > 0
    ? (gradedCourses.reduce((acc, curr) => acc + Number(curr.average_grade), 0) / gradedCourses.length).toFixed(1)
    : null;

  // 3. Asistencia a Talleres (Suma real de sesiones asistidas)
  const totalAttendedSessions = enrollments.reduce((acc, curr) => acc + (curr.attended_sessions || 0), 0);

  // 4. Avance General (Cálculo Real)
  const completedCoursesCount = enrollments.filter(e => e.status === 'completada' || e.status === 'aprobada').length;
  const overallProgress = enrollments.length > 0
    ? Math.round(
        completedCoursesCount > 0 
          ? (completedCoursesCount / enrollments.length) * 100 
          : (totalAttendedSessions > 0 ? Math.min(100, Math.round((totalAttendedSessions / (enrollments.length * 16)) * 100)) : 0)
      )
    : 0;

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. Encabezado Centrado Limpio (Solo el Título de bienvenida sin frases saturadas) */}
      <section className="text-center mx-auto max-w-3xl pt-2 pb-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold font-montserrat tracking-tight text-white leading-tight">
          ¡Bienvenido de nuevo,{' '}
          <span className="bg-gradient-to-r from-[#D4AF37] via-[#F5D77A] to-[#D4AF37] bg-clip-text text-transparent">
            {firstName}
          </span>!
        </h1>
      </section>

      {/* 2. Rejilla de 4 Métricas Clave (Datos 100% Reales del Usuario) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Métrica 1: Cursos Activos */}
        <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl hover:border-[#D4AF37]/30 transition-colors">
          <div className="flex items-center justify-between text-[#99907c] mb-3">
            <span className="text-[10px] font-montserrat uppercase tracking-[0.18em] font-semibold">
              Cursos Activos
            </span>
            <div className="w-8 h-8 rounded-full bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37]">
              <Pencil className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-bold font-montserrat text-white">
              {activeCoursesCount < 10 ? `0${activeCoursesCount}` : activeCoursesCount}
            </div>
            {activeEnrollments.length > 0 ? (
              <ul className="mt-4 space-y-1.5 text-xs text-[#d0c5af]">
                {activeEnrollments.slice(0, 2).map((e: any, i: number) => (
                  <li key={e.id || i} className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0"></span>
                    <span className="truncate">{e.course?.title || 'Taller Inscrito'}</span>
                  </li>
                ))}
                {activeEnrollments.length > 2 && (
                  <li className="text-[11px] text-[#99907c] italic pl-3.5">
                    +{activeEnrollments.length - 2} curso(s) más
                  </li>
                )}
              </ul>
            ) : (
              <p className="mt-4 text-xs text-[#99907c]">
                Sin cursos matriculados aún
              </p>
            )}
          </div>
        </div>

        {/* Métrica 2: Avance General */}
        <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl hover:border-[#D4AF37]/30 transition-colors">
          <div className="flex items-center justify-between text-[#99907c] mb-3">
            <span className="text-[10px] font-montserrat uppercase tracking-[0.18em] font-semibold">
              Avance General
            </span>
            <div className="w-8 h-8 rounded-full bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-bold font-montserrat text-white">
              {hasRealCourses ? `${overallProgress}%` : '0%'}
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-[#99907c] mb-2 font-montserrat">
                <span>Estado de formación</span>
                <span className="text-white font-medium">
                  {hasRealCourses ? `${completedCoursesCount} de ${activeCoursesCount} completados` : 'Inactivo'}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#262629] overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] transition-all duration-500" 
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Métrica 3: Promedio de Rúbricas */}
        <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl hover:border-[#D4AF37]/30 transition-colors">
          <div className="flex items-center justify-between text-[#99907c] mb-3">
            <span className="text-[10px] font-montserrat uppercase tracking-[0.18em] font-semibold">
              Promedio de Rúbricas
            </span>
            <div className="w-8 h-8 rounded-full bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37]">
              <Star className="w-4 h-4 fill-[#D4AF37]" />
            </div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-bold font-montserrat text-white flex items-baseline gap-1">
              {averageGrade ? averageGrade : '—'} <span className="text-xl sm:text-2xl font-light text-[#99907c]">/ 5.0</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-[10px] uppercase font-montserrat tracking-widest text-[#99907c]">
                Rendimiento
              </span>
              {averageGrade ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] font-semibold text-[11px] font-montserrat">
                  {Number(averageGrade) >= 4.5 ? '🏆 Excelente' : '👍 Aprobado'}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#1b1b1f] border border-[#262629] text-[10px] text-[#99907c]">
                  Sin calificar
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Métrica 4: Asistencia a Talleres */}
        <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl hover:border-[#D4AF37]/30 transition-colors">
          <div className="flex items-center justify-between text-[#99907c] mb-3">
            <span className="text-[10px] font-montserrat uppercase tracking-[0.18em] font-semibold">
              Asistencia a Talleres
            </span>
            <div className="w-8 h-8 rounded-full bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37]">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-bold font-montserrat text-white">
              {totalAttendedSessions}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-montserrat">
              <span className="text-[#99907c]">Sesiones presenciales</span>
              <span className="text-[#D4AF37] font-semibold">
                {totalAttendedSessions > 0 ? `${totalAttendedSessions} registradas` : '0 registradas'}
              </span>
            </div>
          </div>
        </div>

      </section>

      {/* 3. Bloque Principal: Tablero de Anuncios y Eventos + Mis Cursos Activos */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        
        {/* Columna Izquierda (lg:col-span-7): Tablero de Anuncios & Próximos Eventos */}
        <div className="lg:col-span-7 bg-[#17171a] border border-[#262629] rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          
          <div>
            {/* Header del Tablero */}
            <div className="flex items-center justify-between border-b border-[#262629] pb-4">
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-xs sm:text-sm font-montserrat uppercase tracking-[0.15em] text-[#D4AF37] font-bold">
                  Tablero de Anuncios & Comunidad
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#262629] border border-[#38383c] text-[10px] font-montserrat uppercase tracking-wider text-[#d0c5af] font-medium">
                Vigencia {new Date().getFullYear()}
              </span>
            </div>

            {featuredAnnouncement ? (
              <>
                {/* Anuncio Principal Destacado (Sin imagen quemada) */}
                <div className="mt-6 bg-[#1b1b1f] border border-[#262629] hover:border-[#D4AF37]/40 transition-all rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-lg space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {featuredAnnouncement.is_pinned && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-montserrat uppercase font-bold tracking-wider">
                          <Sparkles className="w-3 h-3" />
                          Aviso Destacado
                        </span>
                      )}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#262629] bg-[#141417] text-[#d0c5af] text-[10px] font-montserrat uppercase font-bold tracking-wider">
                        {featuredAnnouncement.category === 'ph' 
                          ? 'Propiedad Horizontal' 
                          : featuredAnnouncement.category === 'academico' 
                          ? 'Académico' 
                          : featuredAnnouncement.category === 'evento' 
                          ? 'Evento' 
                          : 'Institucional'}
                      </span>
                    </div>

                    <span className="text-[11px] text-[#99907c] font-montserrat flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {new Date(featuredAnnouncement.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white font-montserrat leading-snug">
                      {featuredAnnouncement.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#d0c5af] leading-relaxed mt-2 whitespace-pre-wrap">
                      {featuredAnnouncement.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#262629] flex flex-wrap items-center justify-between text-xs text-[#99907c] gap-2">
                    <span>Audiencia: <strong className="text-[#e4e1e7]">{featuredAnnouncement.target_audience}</strong></span>
                    <span className="text-[11px] text-[#D4AF37] font-medium">Fundación Principio & Fin</span>
                  </div>
                </div>

                {/* Lista de Anuncios Secundarios */}
                {secondaryAnnouncements.length > 0 && (
                  <div className="mt-5 space-y-3">
                    {secondaryAnnouncements.map((ann: any) => (
                      <div 
                        key={ann.id}
                        className="bg-[#1b1b1f]/60 border border-[#262629] rounded-xl p-4 flex items-start gap-3.5 hover:border-[#D4AF37]/30 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#262629] text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-semibold text-white font-montserrat truncate">
                              {ann.title}
                            </h4>
                            <span className="text-[10px] text-[#99907c] shrink-0 font-montserrat">
                              {new Date(ann.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <p className="text-xs text-[#99907c] mt-0.5 leading-relaxed line-clamp-2">
                            {ann.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="mt-8 py-12 px-6 bg-[#1b1b1f]/40 border border-[#262629] border-dashed rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#99907c] mx-auto">
                  <Megaphone className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h4 className="text-sm font-semibold text-white font-montserrat">
                  Sin avisos recientes en el tablero
                </h4>
                <p className="text-xs text-[#99907c] max-w-sm mx-auto leading-relaxed">
                  Las circulares informativas, cronogramas de talleres y novedades de la Fundación se publicarán directamente aquí.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* Columna Derecha (lg:col-span-5): Mis Cursos Activos (Datos Reales de Jan) */}
        <div className="lg:col-span-5 bg-[#17171a] border border-[#262629] rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col justify-between shadow-2xl">
          
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#262629] pb-4">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-lg font-semibold font-montserrat text-white">
                  Mis Cursos Activos
                </h2>
              </div>
              <Link
                href="/portal/cursos"
                className="text-[11px] font-montserrat font-bold uppercase tracking-wider text-[#D4AF37] hover:text-[#F5D77A] transition-colors"
              >
                Ver Todos
              </Link>
            </div>

            {/* Lista de Cursos Reales */}
            <div className="space-y-4 mt-6">
              {activeEnrollments.length > 0 ? (
                activeEnrollments.map((enrollment: any) => {
                  const course = enrollment.course;
                  const grade = enrollment.average_grade ? Number(enrollment.average_grade).toFixed(1) : '—';
                  const modalityText = course?.modality === 'presencial' ? 'TALLER PRESENCIAL' : 'TALLER SEMESTRAL';
                  
                  return (
                    <div
                      key={enrollment.id}
                      className="bg-[#1b1b1f] border border-[#262629] hover:border-[#D4AF37]/50 rounded-xl p-4 sm:p-5 transition-all group shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                          {modalityText}
                        </span>
                        <Link
                          href="/portal/cursos"
                          className="w-8 h-8 rounded-lg bg-[#262629] group-hover:bg-[#D4AF37] text-[#d0c5af] group-hover:text-[#0A0A0E] flex items-center justify-center transition-all cursor-pointer shadow-sm"
                          title="Ir al curso"
                        >
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </Link>
                      </div>

                      <h3 className="text-base sm:text-lg font-semibold text-white font-montserrat group-hover:text-[#D4AF37] transition-colors">
                        {course?.title || 'Curso Matriculado'}
                      </h3>

                      {course?.schedule_text && (
                        <p className="text-xs text-[#99907c] mt-1 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-[#D4AF37]" />
                          <span>{course.schedule_text}</span>
                        </p>
                      )}

                      {/* Sesiones y Progreso */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-[#99907c] mb-1.5 font-montserrat">
                          <span>Sesiones asistidas</span>
                          <span className="text-[#e4e1e7] font-medium">
                            {enrollment.attended_sessions || 0} sesiones
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#262629] overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5D77A]"
                            style={{ width: `${Math.min(100, Math.max(10, (enrollment.attended_sessions || 0) * 10))}%` }}
                          />
                        </div>
                      </div>

                      {/* Docente y Nota parcial */}
                      <div className="mt-4 pt-3 border-t border-[#262629] flex items-center justify-between text-xs text-[#99907c]">
                        <span>Docente: <strong className="text-[#e4e1e7] font-medium">{course?.instructor_name || 'Docente Asignado'}</strong></span>
                        <span className="font-montserrat">
                          Nota parcial: <strong className="text-[#D4AF37] font-bold">{grade}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-[#1b1b1f]/40 border border-[#262629] border-dashed rounded-xl p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#99907c] mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-white font-montserrat">
                    Aún no tienes cursos inscritos
                  </h4>
                  <p className="text-xs text-[#99907c] max-w-xs mx-auto leading-relaxed">
                    Descubre los talleres disponibles en artesanía, cerámica, oficios y bienestar.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/portal/catalogo"
                      className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0A0A0E] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-montserrat hover:bg-[#F5D77A] transition-colors"
                    >
                      Explorar Catálogo
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
