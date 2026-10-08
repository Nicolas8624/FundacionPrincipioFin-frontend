import { redirect } from 'next/navigation';
import { createServerClient } from '@/services/supabase/server';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Verificación adicional de sesión (opcional, ya se hace en middleware)
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar Admin */}
      <aside className="w-64 border-r border-outline-variant bg-surface-container-low flex flex-col">
        <div className="p-6 border-b border-outline-variant">
          <h2 className="text-primary font-montserrat font-bold tracking-widest text-sm uppercase">
            Sanctuary Admin
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard" className="block px-4 py-2 rounded-lg text-on-surface hover:bg-surface-container hover:text-primary transition-colors text-sm font-inter">
            Resumen
          </Link>
          <Link href="/admin/cursos" className="block px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors text-sm font-inter">
            Cursos y Programas
          </Link>
          <Link href="/admin/solicitudes-ph" className="block px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors text-sm font-inter">
            Solicitudes PH
          </Link>
          <Link href="/admin/cms" className="block px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors text-sm font-inter">
            Gestor de Contenidos
          </Link>
        </nav>
        <div className="p-4 border-t border-outline-variant">
          <p className="text-xs text-on-surface-variant truncate">
            {user.email}
          </p>
          <form action="/auth/signout" method="post" className="mt-2">
            <button className="text-xs text-error hover:text-error-container font-semibold uppercase tracking-wider">
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-auto bg-surface relative">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
