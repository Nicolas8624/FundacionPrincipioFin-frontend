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

  let isSuccess = false;
  let errorMessage = "";
  let targetRoute = "";

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("DEBUG SUPABASE ERROR:", error.message);
      errorMessage = "Credenciales inválidas o correo no confirmado.";
    } else {
      isSuccess = true;
      let role = 'user';
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
          
        if (profile?.role) {
          role = profile.role;
        }
      }

      if (role === 'admin') {
        revalidatePath('/admin', 'layout');
        targetRoute = '/admin/dashboard';
      } else {
        revalidatePath('/portal', 'layout');
        targetRoute = '/portal';
      }
    }
  } catch (err: any) {
    console.error("DEBUG CATCH ERROR:", err);
    errorMessage = err.message || "Error inesperado de conexión";
    isSuccess = false;
  }

  // CRÍTICO: en vez de usar redirect() en el servidor que puede causar congelamiento en el cliente,
  // devolvemos la ruta de éxito para que el cliente navegue explícitamente.
  if (isSuccess && targetRoute) {
    return { success: true, redirect: targetRoute };
  }

  return { error: errorMessage };
}
