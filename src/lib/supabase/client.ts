import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') 
    ? process.env.NEXT_PUBLIC_SUPABASE_URL 
    : 'https://placeholder.supabase.co'
    
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'tu_supabase_anon_key'
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : 'anon-key-placeholder'

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
