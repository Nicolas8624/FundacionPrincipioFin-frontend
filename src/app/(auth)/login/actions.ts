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

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Si falla, retornamos a /login con el mensaje de error en la URL
    redirect('/login?message=Credenciales incorrectas. Intenta nuevamente.')
  }

  // Si tiene éxito, refrescamos el caché del layout del admin y redirigimos
  revalidatePath('/admin', 'layout')
  redirect('/admin/dashboard')
}
