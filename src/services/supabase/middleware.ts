import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  
  let role = 'user'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (profile?.role) {
      role = profile.role
    }
  }

  // Protección de rutas para usuarios no autenticados
  if (
    !user &&
    (url.pathname.startsWith('/admin') || url.pathname.startsWith('/portal'))
  ) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Protección de rutas de Administrador: solo para rol admin
  if (user && url.pathname.startsWith('/admin') && role !== 'admin') {
    url.pathname = '/portal'
    return NextResponse.redirect(url)
  }

  // Si el usuario ya está logueado y trata de acceder a login, redirigir según su rol
  if (user && (url.pathname === '/login' || url.pathname === '/registro')) {
    if (role === 'admin') {
      url.pathname = '/admin/dashboard'
    } else {
      url.pathname = '/portal'
    }
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
