-- =====================================================================
-- PERMISOS RLS PARA INSCRIPCIÓN A CURSOS (course_enrollments)
-- =====================================================================
-- Fundación Principio & Fin
-- Permite que visitantes anónimos y usuarios autenticados puedan registrar
-- su postulación/inscripción a los talleres comunitarios en estado 'pendiente'.
-- Ejecutar en Supabase > SQL Editor
-- =====================================================================

-- 0. Función auxiliar is_admin si no existe aún en la base de datos
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- 1. Permitir inserción de inscripciones para visitantes anónimos y usuarios autenticados
DROP POLICY IF EXISTS "enrollments_insert_pub" ON public.course_enrollments;
CREATE POLICY "enrollments_insert_pub" ON public.course_enrollments 
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'pendiente' 
    AND (user_id IS NULL OR user_id = auth.uid() OR public.is_admin())
  );

-- 2. Asegurar que el estudiante autenticado pueda consultar sus inscripciones por user_id o email
DROP POLICY IF EXISTS "enrollments_select_own" ON public.course_enrollments;
CREATE POLICY "enrollments_select_own" ON public.course_enrollments
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR LOWER(email) = LOWER(auth.jwt() ->> 'email')
    OR public.is_admin()
  );

-- 3. Acceso total para administradores
DROP POLICY IF EXISTS "enrollments_admin_all" ON public.course_enrollments;
CREATE POLICY "enrollments_admin_all" ON public.course_enrollments
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
