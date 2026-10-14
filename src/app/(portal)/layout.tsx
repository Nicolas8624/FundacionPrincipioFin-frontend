import { redirect } from 'next/navigation';
import { createServerClient } from '@/services/supabase/server';
import { PortalLayoutClient } from './PortalLayoutClient';

export const dynamic = 'force-dynamic';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  const userFullName = profile?.full_name || user.user_metadata?.full_name || 'Estudiante';
  const userEmail = user.email || '';
  const role = profile?.role || 'user';

  return (
    <PortalLayoutClient userFullName={userFullName} userEmail={userEmail} role={role}>
      {children}
    </PortalLayoutClient>
  );
}
