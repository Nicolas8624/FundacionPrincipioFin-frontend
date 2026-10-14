import { notFound, redirect } from 'next/navigation';
import { createServerClient } from '@/services/supabase/server';
import { 
  StudentAssignmentClient, 
  ActivityData 
} from '@/components/portal/StudentAssignmentClient';

export const dynamic = 'force-dynamic';

export default async function ActividadPage({
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

  // 1. Consultar la asignación en Supabase con su curso y módulo
  let assignmentRow: any = null;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (isUuid) {
    const { data } = await supabase
      .from('assignments')
      .select(`
        id,
        title,
        instructions,
        due_at,
        weight_percent,
        max_score,
        rubric_criteria,
        attachment_url,
        course_id,
        module_id,
        course:courses (
          id,
          title,
          slug,
          instructor_name,
          cohort,
          modality
        ),
        module:course_modules (
          id,
          title,
          sort_order
        )
      `)
      .eq('id', id)
      .maybeSingle();
    assignmentRow = data;
  }

  // Si no se encontró por UUID o el id no es UUID, buscar por coincidencia en título
  if (!assignmentRow) {
    const { data: searchData } = await supabase
      .from('assignments')
      .select(`
        id,
        title,
        instructions,
        due_at,
        weight_percent,
        max_score,
        rubric_criteria,
        attachment_url,
        course_id,
        module_id,
        course:courses (
          id,
          title,
          slug,
          instructor_name,
          cohort,
          modality
        ),
        module:course_modules (
          id,
          title,
          sort_order
        )
      `)
      .ilike('title', `%${id.replace(/-/g, ' ')}%`)
      .limit(1)
      .maybeSingle();
    assignmentRow = searchData;
  }

  // Si la actividad no existe, mostrar 404
  if (!assignmentRow) {
    notFound();
  }

  // 2. Consultar la entrega previa del usuario si existe
  const { data: submissionRow } = await supabase
    .from('submissions')
    .select(`
      id,
      status,
      submitted_at,
      score,
      feedback,
      project_title,
      text_content,
      files:submission_files (
        id,
        file_name,
        size_bytes,
        url
      )
    `)
    .eq('assignment_id', assignmentRow.id)
    .eq('user_id', user.id)
    .maybeSingle();

  // 3. Consultar la matrícula del estudiante a este curso
  const courseId = assignmentRow.course_id;
  let enrollmentId: string | null = null;
  if (courseId) {
    const { data: enrollRow } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('course_id', courseId)
      .or(`user_id.eq.${user.id},email.ilike.${user.email || ''}`)
      .maybeSingle();
    enrollmentId = enrollRow?.id || null;
  }

  // 4. Consultar materiales didácticos del módulo o curso
  const { data: materialsData } = await supabase
    .from('course_materials')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true })
    .limit(3);

  const materialsList = materialsData || [];

  const courseData = assignmentRow.course;
  const moduleData = assignmentRow.module;

  // Formatear fecha límite y calcular días restantes dinámicamente
  const dueRaw = assignmentRow.due_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const dueDate = new Date(dueRaw);
  const dueFormatted = dueDate.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let daysRemainingText = 'Fecha límite establecida';
  if (diffDays > 1) {
    daysRemainingText = `Quedan ${diffDays} días`;
  } else if (diffDays === 1) {
    daysRemainingText = 'Vence mañana';
  } else if (diffDays === 0) {
    daysRemainingText = 'Vence hoy';
  } else {
    daysRemainingText = 'Plazo de entrega finalizado';
  }

  // Extraer código de actividad dinámicamente (ej. "Actividad 3.3", "Actividad 1.1")
  let activityCode = 'Actividad';
  const codeMatch = assignmentRow.title.match(/^(Actividad\s+[\d\.]+|Taller\s+[\d\.]+)/i);
  if (codeMatch) {
    activityCode = codeMatch[1];
  } else if (moduleData?.sort_order) {
    activityCode = `Actividad Módulo ${moduleData.sort_order}`;
  }

  // Rúbrica de evaluación: si existe en la base de datos se usa, si no se calcula dinámicamente
  let rubricCriteria = [];
  if (Array.isArray(assignmentRow.rubric_criteria) && assignmentRow.rubric_criteria.length > 0) {
    rubricCriteria = assignmentRow.rubric_criteria;
  } else {
    rubricCriteria = [
      {
        number: '01',
        title: 'Aplicación Práctica y Rigor Metodológico',
        weight: 40,
        desc: 'Correcta implementación de los conceptos, técnicas manuales y especificaciones requeridas por el docente.',
      },
      {
        number: '02',
        title: 'Calidad de Acabado y Presentación de Evidencias',
        weight: 35,
        desc: 'Prolijidad en el desarrollo del proyecto, nivel de detalle y claridad en el registro fotográfico o documental adjunto.',
      },
      {
        number: '03',
        title: 'Creatividad, Autonomía y Sustentación',
        weight: 25,
        desc: 'Aporte personal, coherencia estética o técnica y capacidad de argumentación en la memoria entregada.',
      },
    ];
  }

  // Objetivos de aprendizaje dinámicos
  const objectives = [
    {
      title: 'DESARROLLO PRÁCTICO Y TÉCNICO',
      desc: `Ejecución de las destrezas transmitidas en ${courseData?.title || 'el curso'}, garantizando altos estándares técnicos.`,
      icon: 'modelado',
    },
    {
      title: 'REGISTRO DE PROCESO Y BITÁCORA',
      desc: 'Documentación visual y escrita de las etapas de elaboración, dificultades superadas y soluciones aplicadas.',
      icon: 'horno',
    },
    {
      title: 'IMPACTO COMUNITARIO O PRODUCTIVO',
      desc: 'Reflexión y fundamentación sobre la aplicabilidad del proyecto en el contexto familiar, comunitario o de emprendimiento.',
      icon: 'comunidad',
    },
  ];

  // Materiales de apoyo y guías oficiales
  const supportFiles = [];
  if (assignmentRow.attachment_url) {
    supportFiles.push({
      name: assignmentRow.attachment_url.split('/').pop() || 'guia_oficial_actividad.pdf',
      size: 'Documento oficial',
      type: 'PDF',
      tag: 'Protocolo Oficial',
      url: assignmentRow.attachment_url,
    });
  }

  materialsList.forEach((mat: any) => {
    supportFiles.push({
      name: mat.title,
      size: mat.file_size ? `${(mat.file_size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB',
      type: mat.file_type || 'PDF',
      tag: 'Material Didáctico',
      url: mat.file_url,
    });
  });

  if (supportFiles.length === 0) {
    supportFiles.push({
      name: 'guia_orientacion_pedagogica.pdf',
      size: '1.2 MB',
      type: 'PDF',
      tag: 'Guía de Orientación',
    });
  }

  const subFile = (submissionRow as any)?.files?.[0];
  const submissionFileSize = subFile?.size_bytes 
    ? `${(subFile.size_bytes / (1024 * 1024)).toFixed(1)} MB - Subido`
    : (subFile ? 'Archivo adjunto' : undefined);

  const activity: ActivityData = {
    id: assignmentRow.id,
    courseId: courseData?.id || courseId,
    courseTitle: courseData?.title || 'Curso Formativo',
    moduleTitle: moduleData?.title || 'Módulo Académico',
    activityCode,
    title: assignmentRow.title,
    instructions: assignmentRow.instructions || 'Sigue las indicaciones del formador para desarrollar y entregar esta actividad.',
    dueAt: dueRaw,
    dueFormatted,
    daysRemainingText,
    weightPercent: assignmentRow.weight_percent || 25,
    instructorName: courseData?.instructor_name || 'Docente Formador',
    instructorRole: 'Docente Titular y Facilitador',
    rubricCriteria,
    objectives,
    supportFiles,
    currentSubmission: submissionRow ? {
      id: submissionRow.id,
      status: submissionRow.status,
      submittedAt: submissionRow.submitted_at,
      score: submissionRow.score,
      feedback: submissionRow.feedback,
      projectTitle: submissionRow.project_title,
      textContent: submissionRow.text_content,
      fileName: subFile?.file_name || null,
      fileSize: submissionFileSize || null,
    } : null,
  };

  return (
    <StudentAssignmentClient
      activity={activity}
      userProfile={{
        id: user.id,
        email: user.email || '',
        fullName: user.user_metadata?.full_name || 'Juan',
      }}
      enrollmentId={enrollmentId}
    />
  );
}
