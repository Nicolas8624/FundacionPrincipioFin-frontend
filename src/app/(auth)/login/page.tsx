'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { StarfieldBackground } from '@/components/ui/StarfieldBackground'
import { EarthBackground } from '@/components/ui/EarthBackground'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError('Credenciales inválidas. Por favor, revisa tu correo y contraseña e intenta nuevamente.')
      setLoading(false)
    } else {
      router.push('/admin/dashboard')
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Fondos */}
      <StarfieldBackground />
      <EarthBackground />
      
      {/* Contenedor del Login */}
      <div className="bg-space-card/60 border border-space-border/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden z-10 flex flex-col items-center">
        
        {/* Logo / Encabezado */}
        <div className="mb-8 text-center flex flex-col items-center">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            INGRESO AL PANEL
          </h1>
          <p className="text-gold-light text-sm mb-4 italic">
            "Perdonar, sanar y volver a comenzar"
          </p>
          <p className="text-space-gray text-xs uppercase tracking-wider font-semibold">
            Acceso exclusivo para administradores
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="w-full space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm text-center backdrop-blur-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label className="block text-space-gray text-sm font-medium mb-2" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-space-black/60 border border-space-border focus:border-gold-primary text-white rounded-xl px-4 py-3 outline-none transition-colors"
                placeholder="admin@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-space-gray text-sm font-medium mb-2" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-space-black/60 border border-space-border focus:border-gold-primary text-white rounded-xl px-4 py-3 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-primary to-gold-light text-space-dark font-bold py-3.5 rounded-xl hover:shadow-gold-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide mt-2"
          >
            {loading ? 'Validando...' : 'INGRESAR'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="text-space-gray hover:text-white text-sm transition-colors flex items-center justify-center gap-2">
            <span>&larr;</span> Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  )
}
