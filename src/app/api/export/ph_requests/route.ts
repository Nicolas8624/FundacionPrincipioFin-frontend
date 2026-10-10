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

  const { data: requests, error } = await supabase
    .from('ph_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return new NextResponse('Database Error', { status: 500 });
  }

  // Build CSV
  const headers = ['ID', 'Conjunto', 'Aptos', 'Administrador', 'Rol', 'Email', 'Telefono', 'Localidad', 'Direccion', 'Estado', 'Fecha Registro', 'Mensaje'];
  const rows = requests.map(req => [
    req.id,
    `"${req.complex_name || ''}"`,
    req.residents_count || '',
    `"${req.administrator_name || ''}"`,
    req.role_title || '',
    req.email || '',
    req.phone || '',
    `"${req.locality || ''}"`,
    `"${req.address || ''}"`,
    req.status,
    new Date(req.created_at).toLocaleString('es-CO'),
    `"${(req.message || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  return new NextResponse('\uFEFF' + csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="solicitudes_ph.csv"',
    },
  });
}
