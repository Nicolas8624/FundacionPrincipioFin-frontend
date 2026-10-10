'use server'

import { createServerClient } from '@/services/supabase/server'
import { redirect } from 'next/navigation'

export async function signout() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  cookieStore.delete('local_admin_bypass')
  
  redirect('/login')
}
