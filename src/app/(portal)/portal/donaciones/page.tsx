import { createServerClient } from '@/services/supabase/server';
import { redirect } from 'next/navigation';
import { StudentDonationsClient, DonationItem } from '@/components/portal/StudentDonationsClient';

export const dynamic = 'force-dynamic';

export default async function DonacionesUserPage() {
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

  // Fetch real donation requests associated to the user
  const userEmail = (user.email || profile?.email || '').toLowerCase();
  let query = supabase
    .from('donation_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (userEmail) {
    query = query.or(`user_id.eq.${user.id},email.ilike.${userEmail}`);
  } else {
    query = query.eq('user_id', user.id);
  }

  const { data: donationsData } = await query;
  const donations: DonationItem[] = (donationsData || []) as DonationItem[];

  return (
    <StudentDonationsClient
      initialDonations={donations}
      userProfile={{
        id: user.id,
        email: userEmail,
        full_name: profile?.full_name || user.user_metadata?.full_name || '',
        phone: profile?.phone || '',
      }}
    />
  );
}
