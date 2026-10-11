import { createServerClient } from '@/services/supabase/server';
import { ClassroomWorkspace } from '@/components/admin/classroom/ClassroomWorkspace';

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

  // Try to load course from Supabase
  const { data: courseData } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      modality,
      schedule_text,
      capacity,
      category:course_categories(name, accent_color)
    `)
    .eq('id', id)
    .single();

  // Robust course object: use Supabase if exists, otherwise fallback to active course format
  const course = courseData ? {
    id: courseData.id,
    title: courseData.title || 'Pintura en Cerámica y Oficios',
    modality: courseData.modality || 'hibrido',
    schedule_text: courseData.schedule_text || 'Sábados 9:00 a.m. - 1:00 p.m.',
    capacity: courseData.capacity || 35,
    category: Array.isArray(courseData.category) ? courseData.category[0] : courseData.category
  } : {
    id,
    title: 'Pintura en Cerámica y Oficios',
    modality: 'hibrido',
    schedule_text: 'Sábados 9:00 a.m. - 1:00 p.m.',
    capacity: 35,
    category: { name: 'Arte y Cultura' }
  };

  return <ClassroomWorkspace course={course} initialTab={initialTab} />;
}
