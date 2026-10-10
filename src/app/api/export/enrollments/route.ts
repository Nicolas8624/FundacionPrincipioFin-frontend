import { createServerClient } from '@/services/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Get admin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const { data: enrollments, error } = await supabase
    .from('course_enrollments')
    .select(`
      id,
      full_name,
      document_type,
      document_number,
      phone,
      email,
      status,
      created_at,
      course:courses(title, modality)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return new NextResponse('Database Error', { status: 500 });
  }

  // Build CSV
  const headers = ['ID', 'Nombre Completo', 'Tipo Doc', 'Num Doc', 'Email', 'Telefono', 'Curso Solicitado', 'Modalidad', 'Estado', 'Fecha Registro'];
  const rows = enrollments.map(e => [
    e.id,
    `"${e.full_name}"`, // Quote to handle commas
    e.document_type,
    e.document_number,
    e.email || '',
    e.phone || '',
    `"${e.course?.title || 'Desconocido'}"`,
    e.course?.modality || '',
    e.status,
    new Date(e.created_at).toLocaleString('es-CO')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  return new NextResponse('\uFEFF' + csvContent, { // BOM for Excel UTF-8
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="inscripciones.csv"',
    },
  });
}
