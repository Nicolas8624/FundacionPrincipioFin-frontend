import { createServerClient } from '@/services/supabase/server';
import { redirect } from 'next/navigation';
import { StudentHelpClient, ContactMessageItem } from '@/components/portal/StudentHelpClient';

export const dynamic = 'force-dynamic';

export default async function AyudaUserPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch real profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone')
    .eq('id', user.id)
    .single();

  const userEmail = (user.email || profile?.email || '').toLowerCase();

  // Fetch past PQRS messages belonging to this user
  let query = supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (userEmail) {
    query = query.or(`user_id.eq.${user.id},email.ilike.${userEmail}`);
  } else {
    query = query.eq('user_id', user.id);
  }

  const { data: messagesData } = await query;
  const messages: ContactMessageItem[] = (messagesData || []) as ContactMessageItem[];

  return (
    <StudentHelpClient
      initialMessages={messages}
      userProfile={{
        id: user.id,
        email: userEmail,
        full_name: profile?.full_name || user.user_metadata?.full_name || '',
        phone: profile?.phone || '',
      }}
    />
  );
}
