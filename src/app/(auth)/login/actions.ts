'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/services/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createServerClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/login?message=El correo y la contraseña son obligatorios.')
  }

  // Fallback para desarrollo local
  if (process.env.NODE_ENV === 'development' && email === 'admin@fundacion.org' && password === 'admin123') {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.set('local_admin_bypass', 'true');
    revalidatePath('/admin', 'layout');
    redirect('/admin/dashboard');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Si falla, retornamos a /login con el mensaje de error en la URL
    redirect('/login?message=Credenciales incorrectas. Intenta nuevamente.')
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
