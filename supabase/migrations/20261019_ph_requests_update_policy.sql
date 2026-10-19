-- =====================================================================
-- MIGRACIÓN: PERMISOS PARA ADJUNTAR ACTAS EN SOLICITUDES PH
-- =====================================================================
-- Fundación Principio & Fin
-- Ejecutar en Supabase > SQL Editor para habilitar que el usuario
-- pueda vincular y actualizar el acta de consejo en su solicitud PH.
-- =====================================================================

-- 1. Permitir que el solicitante (por user_id o email coincidente) pueda actualizar su solicitud PH
DROP POLICY IF EXISTS ph_update_own ON public.ph_requests;
CREATE POLICY ph_update_own ON public.ph_requests
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR LOWER(email) = LOWER(auth.jwt() ->> 'email')
    OR public.is_admin()
  )
  WITH CHECK (
    user_id = auth.uid()
    OR LOWER(email) = LOWER(auth.jwt() ->> 'email')
    OR public.is_admin()
  );

-- 2. Asegurar que las solicitudes históricas del usuario tengan asociado su user_id si coincide el correo
UPDATE public.ph_requests r
SET user_id = p.id
FROM public.profiles p
WHERE r.user_id IS NULL 
  AND LOWER(r.email) = LOWER(p.email);
