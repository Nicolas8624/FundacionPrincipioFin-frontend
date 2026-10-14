import { createServerClient } from '@/services/supabase/server';
import { redirect } from 'next/navigation';
import { StudentPhClient, PhRequestItem } from '@/components/portal/StudentPhClient';

export const dynamic = 'force-dynamic';

export default async function SolicitudesPhUserPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch real profile of the student
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone')
    .eq('id', user.id)
    .single();

  // Fetch real ph_requests associated to the user by user_id or email
  const userEmail = (user.email || profile?.email || '').toLowerCase();
  let query = supabase
    .from('ph_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (userEmail) {
    query = query.or(`user_id.eq.${user.id},email.ilike.${userEmail}`);
  } else {
    query = query.eq('user_id', user.id);
  }

  const { data: requestsData } = await query;
  const requests: PhRequestItem[] = (requestsData || []) as PhRequestItem[];

  return (
    <StudentPhClient 
      initialRequests={requests}
      userProfile={{
        id: user.id,
        email: userEmail,
        full_name: profile?.full_name || user.user_metadata?.full_name || '',
        phone: profile?.phone || '',
      }}
    />
  );
}
