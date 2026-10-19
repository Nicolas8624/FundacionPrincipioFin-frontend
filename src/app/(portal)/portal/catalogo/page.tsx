import { createServerClient } from '@/services/supabase/server';
import { redirect } from 'next/navigation';
import { StudentCatalogClient, CatalogCourse } from '@/components/portal/StudentCatalogClient';

export const dynamic = 'force-dynamic';

export default async function CatalogoTalleresPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Obtener perfil del usuario para autocompletar su formulario de inscripción
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const currentUser = {
    id: user.id,
    fullName: profile?.full_name || user.user_metadata?.full_name || 'Estudiante',
    email: user.email || '',
    phone: profile?.phone || '',
    documentType: profile?.document_type || 'CC',
    documentNumber: profile?.document_number || '',
  };

  // 2. Obtener categorías de cursos desde la base de datos
  const { data: categoriesData } = await supabase
    .from('course_categories')
    .select('id, name, slug')
    .order('sort_order', { ascending: true });

  const categories = categoriesData || [];

  // 3. Obtener inscripciones del usuario actual distinguiendo confirmadas vs pendientes
  const { data: userEnrollmentsData } = await supabase
    .from('course_enrollments')
    .select('course_id, status')
    .or(`user_id.eq.${user.id},email.ilike.${user.email || ''}`)
    .not('status', 'in', '("cancelada","rechazada")');

  const rawEnrollments = userEnrollmentsData || [];
  const confirmedCourseIds = rawEnrollments
    .filter((e: any) => e.status === 'confirmada' || e.status === 'aprobada' || e.status === 'completada')
    .map((e: any) => e.course_id);

  const pendingCourseIds = rawEnrollments
    .filter((e: any) => e.status === 'pendiente')
    .map((e: any) => e.course_id);

  // 4. Obtener TODOS los cursos de la base de datos (excluyendo solo los archivados)
  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      slug,
      short_description,
      description,
      modality,
      status,
      capacity,
      schedule_text,
      location,
      instructor_name,
      cohort,
      total_sessions,
      image_url,
      category_id,
      category:course_categories (
        name,
        slug,
        accent_color
      ),
      enrollments:course_enrollments (
        id,
        user_id,
        status
      )
    `)
    .neq('status', 'archivado')
    .order('created_at', { ascending: false });

  if (coursesError) {
    console.error('Error al cargar cursos del catálogo:', coursesError);
  }

  // 5. Mapear los cursos directamente desde la base de datos
  const courses: CatalogCourse[] = (coursesData || []).map((c: any) => {
    // Contar inscripciones confirmadas o activas
    const confirmedEnrollments = (c.enrollments || []).filter(
      (e: any) => e.status !== 'cancelada' && e.status !== 'rechazada'
    ).length;

    // Respetar la imagen que el curso tiene en la base de datos (image_url o img_url)
    const dbImage = c.image_url || c.img_url || '';

    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description || c.short_description || 'Taller formativo comunitario.',
      modality: c.modality || 'presencial',
      status: c.status,
      capacity: c.capacity || 15,
      schedule_text: c.schedule_text || 'Horario por coordinar',
      location: c.location || 'Sede Principal',
      instructor_name: c.instructor_name || 'Docente Formador',
      cohort: c.cohort || '2026',
      total_sessions: c.total_sessions || 16,
      image_url: dbImage,
      category_id: c.category_id,
      category: c.category,
      enrolledCount: confirmedEnrollments
    };
  });

  return (
    <StudentCatalogClient
      initialCourses={courses}
      categories={categories}
      confirmedCourseIds={confirmedCourseIds}
      pendingCourseIds={pendingCourseIds}
      currentUser={currentUser}
    />
  );
}
