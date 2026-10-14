import { notFound, redirect } from 'next/navigation';
import { createServerClient } from '@/services/supabase/server';
import { 
  StudentCourseClassroomClient, 
  CourseClassroomData, 
  ClassroomModule, 
  ClassroomAssignment, 
  ClassroomMaterial 
} from '@/components/portal/StudentCourseClassroomClient';

export const dynamic = 'force-dynamic';

export default async function CourseClassroomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Buscar el curso por ID o por slug
  let courseRow: any = null;

  // Si id parece un UUID válido
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (isUuid) {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    courseRow = data;

    // Si no fue curso, verificar si el id pasado era de una inscripción (enrollment)
    if (!courseRow) {
      const { data: enrollRow } = await supabase
        .from('course_enrollments')
        .select('course:courses(*)')
        .eq('id', id)
        .maybeSingle();
      if (enrollRow && (enrollRow as any).course) {
        courseRow = (enrollRow as any).course;
      }
    }
  }

  // Si aún no se encontró, buscar por slug
  if (!courseRow) {
    const { data: slugRow } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', id)
      .maybeSingle();
    courseRow = slugRow;
  }

  // Si no existe el curso, error 404
  if (!courseRow) {
    notFound();
  }

  const courseId = courseRow.id;

  // 2. Consultar la matrícula de este usuario para este curso
  const { data: enrollmentRow } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('course_id', courseId)
    .or(`user_id.eq.${user.id},email.ilike.${user.email || ''}`)
    .maybeSingle();

  // 3. Consultar los módulos del curso
  const { data: modulesRows } = await supabase
    .from('course_modules')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true });

  const rawModules = modulesRows || [];

  // 4. Consultar las asignaciones / actividades del curso
  const { data: assignmentsRows } = await supabase
    .from('assignments')
    .select('*')
    .eq('course_id', courseId)
    .order('due_at', { ascending: true });

  const rawAssignments = assignmentsRows || [];

  // 5. Consultar las entregas previas del usuario para estas actividades
  const assignmentIds = rawAssignments.map((a: any) => a.id);
  let userSubmissions: any[] = [];
  if (assignmentIds.length > 0) {
    const { data: subsData } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', user.id)
      .in('assignment_id', assignmentIds);
    userSubmissions = subsData || [];
  }

  const submissionsByAssignment = new Map<string, any>();
  userSubmissions.forEach((sub: any) => {
    submissionsByAssignment.set(sub.assignment_id, sub);
  });

  // 6. Consultar materiales didácticos del curso
  const { data: materialsRows } = await supabase
    .from('course_materials')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true });

  const rawMaterials = materialsRows || [];

  // Mapear módulos con sus asignaciones y materiales correspondientes
  let modulesList: ClassroomModule[] = [];

  if (rawModules.length > 0) {
    modulesList = rawModules.map((mod: any) => {
      const modAssignments: ClassroomAssignment[] = rawAssignments
        .filter((a: any) => a.module_id === mod.id)
        .map((a: any) => ({
          id: a.id,
          title: a.title,
          instructions: a.instructions,
          dueAt: a.due_at,
          weightPercent: a.weight_percent,
          maxScore: Number(a.max_score || 5.0),
          submission: submissionsByAssignment.get(a.id) || null,
        }));

      const modMaterials: ClassroomMaterial[] = rawMaterials
        .filter((m: any) => m.module_id === mod.id)
        .map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          fileUrl: m.file_url,
          fileType: m.file_type,
          fileSize: m.file_size,
        }));

      return {
        id: mod.id,
        title: mod.title,
        description: mod.description,
        sortOrder: mod.sort_order,
        assignments: modAssignments,
        materials: modMaterials,
      };
    });

    // Asignaciones que no tienen module_id asignado van a un módulo general
    const orphanAssignments = rawAssignments.filter((a: any) => !a.module_id);
    const orphanMaterials = rawMaterials.filter((m: any) => !m.module_id);

    if (orphanAssignments.length > 0 || orphanMaterials.length > 0) {
      modulesList.push({
        id: 'general-module',
        title: 'Módulo General y Actividades Transversales',
        description: 'Talleres prácticos complementarios del programa pedagógico.',
        sortOrder: 99,
        assignments: orphanAssignments.map((a: any) => ({
          id: a.id,
          title: a.title,
          instructions: a.instructions,
          dueAt: a.due_at,
          weightPercent: a.weight_percent,
          maxScore: Number(a.max_score || 5.0),
          submission: submissionsByAssignment.get(a.id) || null,
        })),
        materials: orphanMaterials.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          fileUrl: m.file_url,
          fileType: m.file_type,
          fileSize: m.file_size,
        })),
      });
    }
  } else {
    // Si no hay módulos creados aún, agrupar todas las asignaciones en un módulo base
    modulesList = [
      {
        id: 'default-module',
        title: 'Módulo Formativo Integral',
        description: 'Talleres prácticos y actividades asignadas por el docente formador.',
        sortOrder: 1,
        assignments: rawAssignments.map((a: any) => ({
          id: a.id,
          title: a.title,
          instructions: a.instructions,
          dueAt: a.due_at,
          weightPercent: a.weight_percent,
          maxScore: Number(a.max_score || 5.0),
          submission: submissionsByAssignment.get(a.id) || null,
        })),
        materials: rawMaterials.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          fileUrl: m.file_url,
          fileType: m.file_type,
          fileSize: m.file_size,
        })),
      },
    ];
  }

  const courseData: CourseClassroomData = {
    id: courseRow.id,
    slug: courseRow.slug,
    title: courseRow.title,
    shortDescription: courseRow.short_description,
    modality: courseRow.modality || 'presencial',
    cohort: courseRow.cohort,
    scheduleText: courseRow.schedule_text,
    location: courseRow.location,
    instructorName: courseRow.instructor_name,
    imageUrl: courseRow.image_url,
    totalSessions: courseRow.total_sessions || 16,
    enrollment: enrollmentRow ? {
      id: enrollmentRow.id,
      status: enrollmentRow.status,
      attendedSessions: enrollmentRow.attended_sessions || 0,
      averageGrade: enrollmentRow.average_grade ? Number(enrollmentRow.average_grade) : null,
      cupoType: enrollmentRow.cupo_type,
    } : null,
    modules: modulesList,
  };

  return <StudentCourseClassroomClient course={courseData} />;
}
