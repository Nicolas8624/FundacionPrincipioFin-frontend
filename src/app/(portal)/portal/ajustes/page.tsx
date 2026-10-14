import { createServerClient } from '@/services/supabase/server';
import { redirect } from 'next/navigation';
import { StudentSettingsClient, ProfileData } from '@/components/portal/StudentSettingsClient';

export const dynamic = 'force-dynamic';

export default async function AjustesUserPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch real profile from Supabase
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const profileData: ProfileData = {
    id: user.id,
    email: user.email || profile?.email || '',
    full_name: profile?.full_name || user.user_metadata?.full_name || '',
    phone: profile?.phone || '',
    document_type: profile?.document_type || 'CC',
    document_number: profile?.document_number || '',
    locality: profile?.locality || 'Bosa, Bogotá',
    birth_date: profile?.birth_date || '',
    role: profile?.role || 'user',
    created_at: profile?.created_at || user.created_at,
  };

  return <StudentSettingsClient initialProfile={profileData} />;
}
