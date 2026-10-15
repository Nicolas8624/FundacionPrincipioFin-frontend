import { createServerClient } from '@/services/supabase/server';
import { redirect } from 'next/navigation';
import { StudentCoursesClient, StudentCourse, AttendedWorkshop } from '@/components/portal/StudentCoursesClient';

export const dynamic = 'force-dynamic';

export default async function MisCursosMatriculadosPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Traer inscripciones reales del usuario autenticado
  const { data: enrollmentsData, error } = await supabase
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
      certificate_code,
      created_at,
      course:courses (
        id,
        title,
        slug,
        instructor_name,
        modality,
        schedule_text,
        location,
        image_url,
        cohort
      )
    `)
    .or(`user_id.eq.${user.id},email.ilike.${user.email || ''}`)
    .not('status', 'in', '("cancelada","rechazada")');

  if (error) {
    console.error('Error al cargar cursos matriculados:', error);
  }

  const enrollments = enrollmentsData || [];

  // 1. Cursos matriculados formalmente activos (confirmada, activa, en_curso)
  const realActive = enrollments.filter(
    (e: any) => e.status === 'confirmada' || e.status === 'activa' || e.status === 'en_curso'
  );

  // 2. Solicitudes de inscripción pendientes de revisión administrativa
  const realPending = enrollments.filter(
    (e: any) => e.status === 'pendiente'
  );

  // 3. Cursos completados o certificados
  const realCompleted = enrollments.filter(
    (e: any) => e.status === 'completada' || e.status === 'aprobada'
  );

  // Mapear cursos activos (100% reales, con matrícula oficial confirmada)
  const activeCourses: StudentCourse[] = realActive.map((e: any, index: number) => {
    const course = e.course;
    const modalityStr = course?.modality === 'hibrido' 
      ? 'HÍBRIDO (PRESENCIAL + VIRTUAL)' 
      : (course?.modality === 'virtual' ? 'VIRTUAL' : 'PRESENCIAL');

    return {
      id: e.id,
      courseId: course?.id || e.course_id,
      title: course?.title || 'Taller Matriculado',
      code: course?.slug ? `PF-${course.slug.substring(0, 3).toUpperCase()}-${index + 1}` : `PF-2026-${index + 1}`,
      modality: course?.modality || 'presencial',
      modalityBadge: modalityStr,
      currentModule: course?.cohort ? `Cohorte ${course.cohort}` : 'Módulo en desarrollo',
      schedule: course?.schedule_text || 'Horario por coordinar',
      location: course?.location || 'Sede Principal',
      instructor: course?.instructor_name || 'Docente Formador',
      image: course?.image_url || (index % 2 === 0 ? '/images/taller-ceramica.jpg' : '/images/taller-decoupage.jpg'),
      nextSessionType: course?.modality === 'virtual' ? 'sync' : 'practical',
      nextSessionTitle: 'Sesión formativa según calendario oficial',
      progressPercent: e.attended_sessions ? Math.min(100, Math.max(10, e.attended_sessions * 10)) : 0,
      statusNote: e.average_grade 
        ? `Calificación parcial: ${Number(e.average_grade).toFixed(1)} / 5.0` 
        : (e.attended_sessions > 0 ? `${e.attended_sessions} sesiones asistidas registradas` : 'Inscripción activa'),
      statusNoteType: e.average_grade ? 'info' : 'warning',
      status: 'activo',
    };
  });

  // Mapear solicitudes pendientes de revisión
  const pendingCourses: StudentCourse[] = realPending.map((e: any, index: number) => {
    const course = e.course;
    const modalityStr = course?.modality === 'hibrido' 
      ? 'HÍBRIDO' 
      : (course?.modality === 'virtual' ? 'VIRTUAL' : 'PRESENCIAL');

    const formattedDate = e.created_at
      ? new Date(e.created_at).toLocaleDateString('es-CO', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Reciente';

    return {
      id: e.id,
      courseId: course?.id || e.course_id,
      title: course?.title || 'Taller Solicitado',
      code: course?.slug ? `PF-${course.slug.substring(0, 3).toUpperCase()}-${index + 1}` : `SOL-${index + 1}`,
      modality: course?.modality || 'presencial',
      modalityBadge: modalityStr,
      currentModule: 'En proceso de validación',
      schedule: course?.schedule_text || 'Horario por coordinar',
      location: course?.location || 'Sede Principal',
      instructor: course?.instructor_name || 'Docente Formador',
      image: course?.image_url || '/images/taller-ceramica.jpg',
      nextSessionType: 'practical',
      nextSessionTitle: 'Validación de cupo y documentos por Coordinación',
      progressPercent: 0,
      statusNote: `Solicitud radicada el ${formattedDate} · En espera de cupo oficial`,
      statusNoteType: 'warning',
      status: 'pendiente',
      cupoType: e.cupo_type || 'Cupo Regular',
      requestedAt: formattedDate,
    };
  });

  // Mapear cursos completados (100% reales)
  const completedCourses: StudentCourse[] = realCompleted.map((e: any) => {
    const course = e.course;
    return {
      id: e.id,
      courseId: course?.id || e.course_id,
      title: course?.title || 'Taller Completado',
      code: e.certificate_code || 'CERT-PF-OFICIAL',
      modality: course?.modality || 'presencial',
      modalityBadge: 'FINALIZADO',
      currentModule: 'Ciclo culminado',
      schedule: course?.schedule_text || 'Culminado',
      location: course?.location || 'Sede Principal',
      instructor: course?.instructor_name || 'Docente Formador',
      image: course?.image_url || '/images/taller-ceramica.jpg',
      nextSessionType: 'practical',
      nextSessionTitle: 'Ciclo culminado',
      progressPercent: 100,
      statusNote: e.certificate_code ? `Certificado emitido: ${e.certificate_code}` : 'Aprobado satisfactoriamente',
      statusNoteType: 'info',
      status: 'completado',
      grade: e.average_grade ? Number(e.average_grade).toFixed(1) : undefined,
      hours: 'Horas lectivas certificadas',
      certificateCode: e.certificate_code || undefined
    };
  });

  // Total de sesiones asistidas calculadas estrictamente de la base de datos
  const totalWorkshopsAttended = enrollments.reduce((acc, curr) => acc + (curr.attended_sessions || 0), 0);

  // Lista de talleres con registro de asistencia real
  const attendedWorkshops: AttendedWorkshop[] = enrollments
    .filter((e: any) => (e.attended_sessions || 0) > 0)
    .map((e: any) => {
      const course = e.course;
      return {
        id: e.id,
        courseTitle: course?.title || 'Taller Formativo',
        instructor: course?.instructor_name || 'Docente Formador',
        location: course?.location || 'Sede Principal',
        modality: course?.modality || 'presencial',
        attendedSessions: e.attended_sessions || 0
      };
    });

  return (
    <StudentCoursesClient
      initialActiveCourses={activeCourses}
      initialPendingCourses={pendingCourses}
      initialCompletedCourses={completedCourses}
      totalWorkshopsAttended={totalWorkshopsAttended}
      attendedWorkshops={attendedWorkshops}
    />
  );
}
