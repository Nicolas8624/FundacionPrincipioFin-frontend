'use server'

import { redirect } from 'next/navigation'
import { createServerClient } from '@/services/supabase/server'

export async function register(formData: FormData) {
  const supabase = await createServerClient()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password || !name) {
    redirect('/registro?message=Todos los campos son obligatorios.')
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      }
    }
  })

  if (error) {
    redirect('/registro?message=No se pudo crear la cuenta. Intenta con otro correo.')
  }

  redirect('/login?message=Cuenta creada exitosamente. Por favor inicia sesión.')
}
