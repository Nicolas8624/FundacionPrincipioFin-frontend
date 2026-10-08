'use server'

import { createServerClient } from '@/services/supabase/server'
import { redirect } from 'next/navigation'

export async function signout() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}
