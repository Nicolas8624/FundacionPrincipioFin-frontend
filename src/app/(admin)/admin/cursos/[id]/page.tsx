import { notFound } from 'next/navigation';
import { createServerClient } from '@/services/supabase/server';
import { ClassroomWorkspace } from '@/components/admin/classroom/ClassroomWorkspace';
import type {
  ClassroomAssignment,
  ClassroomCourse,
  ClassroomEnrollment,
  ClassroomModule,
  ClassroomSubmission
} from '@/components/admin/classroom/types';
import { formatDocument } from '@/components/admin/classroom/types';

export const dynamic = 'force-dynamic';

export default async function CourseClassroomPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const sParams = searchParams ? await searchParams : {};
  const initialTab = sParams.tab === 'estudiantes' ? 'estudiantes' : 'aula';

  const supabase = await createServerClient();

  // 1. Curso (select * para no romper si la migración aún no se ha ejecutado)
  const { data: courseRow } = await supabase
    .from('courses')
    .select('*, category:course_categories(name, accent_color)')
    .eq('id', id)
    .maybeSingle();

  if (!courseRow) notFound();

  const c = courseRow as any;
  const course: ClassroomCourse = {
    id: c.id,
    title: c.title,
    modality: c.modality,
    schedule_text: c.schedule_text ?? null,
    capacity: c.capacity ?? null,
    cohort: c.cohort ?? null,
    instructor_name: c.instructor_name ?? null,
    start_date: c.start_date ?? null,
    end_date: c.end_date ?? null,
    category: Array.isArray(c.category) ? c.category[0] ?? null : c.category ?? null
  };

  // 2-4. Módulos, asignaciones e inscripciones en paralelo
  const [modulesRes, assignmentsRes, enrollmentsRes] = await Promise.all([
    supabase.from('course_modules').select('*').eq('course_id', id).order('sort_order', { ascending: true }),
    supabase.from('assignments').select('*').eq('course_id', id).order('created_at', { ascending: true }),
    supabase.from('course_enrollments').select('*').eq('course_id', id).order('created_at', { ascending: false })
  ]);

  const modules: ClassroomModule[] = (modulesRes.data || []).map((m: any) => ({
    id: m.id,
    title: m.title,
    sort_order: m.sort_order ?? 0
  }));

  const assignments: ClassroomAssignment[] = (assignmentsRes.data || []).map((a: any) => ({
    id: a.id,
    title: a.title,
    module_id: a.module_id ?? null,
    instructions: a.instructions ?? null,
    due_at: a.due_at ?? null,
    publish_at: a.publish_at ?? null,
    weight_percent: a.weight_percent ?? null,
    max_score: Number(a.max_score) || 5,
    rubric_criteria: Array.isArray(a.rubric_criteria) ? a.rubric_criteria : [],
    attachment_url: a.attachment_url ?? null,
    is_published: Boolean(a.is_published),
    created_at: a.created_at
  }));

  const enrollments: ClassroomEnrollment[] = (enrollmentsRes.data || []).map((e: any) => ({
    id: e.id,
    user_id: e.user_id ?? null,
    full_name: e.full_name,
    document_type: e.document_type ?? null,
    document_number: e.document_number ?? null,
    phone: e.phone ?? null,
    email: e.email ?? null,
    locality: e.locality ?? null,
    birth_date: e.birth_date ?? null,
    guardian_name: e.guardian_name ?? null,
    status: e.status,
    admin_notes: e.admin_notes ?? null,
    cupo_type: e.cupo_type ?? null,
    motivation: e.motivation ?? null,
    withdrawal_reason: e.withdrawal_reason ?? null,
    withdrawal_date: e.withdrawal_date ?? null,
    attended_sessions: Number(e.attended_sessions) || 0,
    average_grade: e.average_grade !== null && e.average_grade !== undefined ? Number(e.average_grade) : null,
    has_certificate: Boolean(e.has_certificate),
    certificate_code: e.certificate_code ?? null,
    certificate_issued_at: e.certificate_issued_at ?? null,
    created_at: e.created_at,
    updated_at: e.updated_at
  }));

  // 5. Entregas (excepto borradores) de las asignaciones de este curso
  let submissions: ClassroomSubmission[] = [];
  const assignmentIds = assignments.map((a) => a.id);

  if (assignmentIds.length > 0) {
    const { data: subsData } = await supabase
      .from('submissions')
      .select('*, files:submission_files(*)')
      .in('assignment_id', assignmentIds)
      .neq('status', 'borrador')
      .order('submitted_at', { ascending: false });

    const rows = (subsData || []) as any[];

    // Resolver estudiante: por enrollment_id, o por user_id -> inscripción, o perfil
    const enrollmentById = new Map(enrollments.map((e) => [e.id, e]));
    const enrollmentByUser = new Map(enrollments.filter((e) => e.user_id).map((e) => [e.user_id as string, e]));

    const missingUserIds = Array.from(
      new Set(
        rows
          .filter((r) => !(r.enrollment_id && enrollmentById.has(r.enrollment_id)) && r.user_id && !enrollmentByUser.has(r.user_id))
          .map((r) => r.user_id as string)
      )
    );
    const profilesById = new Map<string, any>();
    if (missingUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, document_type, document_number')
        .in('id', missingUserIds);
      (profiles || []).forEach((p: any) => profilesById.set(p.id, p));
    }

    // URLs firmadas para los archivos del bucket privado "submissions"
    const allPaths: string[] = rows.flatMap((r) =>
      (r.files || []).filter((f: any) => !f.url && f.storage_path).map((f: any) => f.storage_path as string)
    );
    const signedByPath = new Map<string, string>();
    if (allPaths.length > 0) {
      const { data: signed } = await supabase.storage.from('submissions').createSignedUrls(allPaths, 60 * 60);
      (signed || []).forEach((s) => {
        if (s.path && s.signedUrl) signedByPath.set(s.path, s.signedUrl);
      });
    }

    submissions = rows.map((r) => {
      const enr =
        (r.enrollment_id && enrollmentById.get(r.enrollment_id)) ||
        (r.user_id && enrollmentByUser.get(r.user_id)) ||
        null;
      const prof = !enr && r.user_id ? profilesById.get(r.user_id) : null;

      return {
        id: r.id,
        assignment_id: r.assignment_id,
        enrollment_id: enr?.id ?? r.enrollment_id ?? null,
        user_id: r.user_id ?? null,
        student_name: enr?.full_name || prof?.full_name || prof?.email || 'Estudiante sin nombre',
        student_document: enr
          ? formatDocument(enr.document_type, enr.document_number)
          : formatDocument(prof?.document_type ?? null, prof?.document_number ?? null),
        project_title: r.project_title ?? null,
        text_content: r.text_content ?? null,
        status: r.status,
        submitted_at: r.submitted_at ?? null,
        is_late: Boolean(r.is_late),
        score: r.score !== null && r.score !== undefined ? Number(r.score) : null,
        feedback: r.feedback ?? null,
        badge: r.badge ?? null,
        rubric_scores: r.rubric_scores && typeof r.rubric_scores === 'object' ? r.rubric_scores : {},
        correction_note: r.correction_note ?? null,
        graded_at: r.graded_at ?? null,
        files: (r.files || []).map((f: any) => ({
          id: f.id,
          file_name: f.file_name,
          mime_type: f.mime_type ?? null,
          url: f.url || (f.storage_path ? signedByPath.get(f.storage_path) ?? null : null)
        }))
      };
    });
  }

  return (
    <ClassroomWorkspace
      course={course}
      initialTab={initialTab}
      modules={modules}
      assignments={assignments}
      enrollments={enrollments}
      submissions={submissions}
    />
  );
}
