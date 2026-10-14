import { redirect } from 'next/navigation';
import { createServerClient } from '@/services/supabase/server';
import { AdminLayoutClient } from './AdminLayoutClient';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const userFullName = profile?.full_name || user.user_metadata?.full_name || 'Administrador';
  const userEmail = user.email || 'Administrador';

  return (
    <AdminLayoutClient userFullName={userFullName} userEmail={userEmail}>
      {children}
    </AdminLayoutClient>
  );
}
