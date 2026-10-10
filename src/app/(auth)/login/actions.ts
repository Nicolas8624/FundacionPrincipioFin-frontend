'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/services/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createServerClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'El correo y la contraseña son obligatorios.' }
  }

  // Fallback para desarrollo local (cualquier credencial sirve)
  if (process.env.NODE_ENV === 'development') {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.set('local_admin_bypass', 'true', { path: '/' });
    revalidatePath('/admin', 'layout');
    redirect('/admin/dashboard');
  }

  let data;
  try {
    const res = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    data = res.data;
    const error = res.error;

    if (error) {
      console.error("DEBUG SUPABASE ERROR:", error.message);
      return { error: error.message };
    }
  } catch (err: any) {
    console.error("DEBUG CATCH ERROR:", err);
    return { error: err.message || "Error inesperado de conexión" };
  }

  let role = 'user'
  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()
      
    if (profile?.role) {
      role = profile.role
    }
  }

  if (role === 'admin') {
    revalidatePath('/admin', 'layout')
    redirect('/admin/dashboard')
  } else {
    revalidatePath('/portal', 'layout')
    redirect('/portal')
  }
}
