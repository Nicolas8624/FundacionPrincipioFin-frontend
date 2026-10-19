-- =====================================================================
-- PERMISOS RLS PARA REGISTRO DE DONACIONES (donation_requests)
-- =====================================================================
-- Fundación Principio & Fin
-- Permite que tanto visitantes anónimos como usuarios autenticados
-- puedan registrar intenciones de donación con estado inicial 'nueva'.
-- Ejecutar en Supabase > SQL Editor
-- =====================================================================

ALTER TABLE public.donation_requests ENABLE ROW LEVEL SECURITY;

-- 1. Permitir inserción de donaciones para anónimos y autenticados
DROP POLICY IF EXISTS "donations_insert_pub" ON public.donation_requests;
CREATE POLICY "donations_insert_pub" ON public.donation_requests 
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'nueva' 
    AND (user_id IS NULL OR user_id = auth.uid() OR public.is_admin())
  );

-- 2. Permitir que el donante consulte sus propias donaciones por user_id o email
DROP POLICY IF EXISTS "donations_select_own" ON public.donation_requests;
CREATE POLICY "donations_select_own" ON public.donation_requests 
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() 
    OR LOWER(email) = LOWER(auth.jwt() ->> 'email') 
    OR public.is_admin()
  );

-- 3. Acceso total de gestión para administradores
DROP POLICY IF EXISTS "donations_admin_all" ON public.donation_requests;
CREATE POLICY "donations_admin_all" ON public.donation_requests 
  FOR ALL TO authenticated
  USING (public.is_admin()) 
  WITH CHECK (public.is_admin());
