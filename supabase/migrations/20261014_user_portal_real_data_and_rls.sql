-- =====================================================================
-- MIGRACIÓN: TOTAL_SESSIONS EN CURSOS, POLÍTICAS RLS Y VINCULACIÓN DE ESTUDIANTES
-- =====================================================================
-- Fundación Principio & Fin
-- Ejecutar en Supabase > SQL Editor para asegurar datos 100% reales en el portal de usuarios.
-- =====================================================================

-- 1. Agregar columna total_sessions a la tabla courses (para asistencia presencial y virtual)
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS total_sessions int NOT NULL DEFAULT 16;

COMMENT ON COLUMN public.courses.total_sessions IS 'Número total de sesiones presenciales o sincrónicas programadas para el curso';

-- 2. Asegurar que las inscripciones históricas con correo de usuario registrado se vinculen a su user_id
UPDATE public.course_enrollments e
SET user_id = p.id
FROM public.profiles p
WHERE e.user_id IS NULL AND LOWER(e.email) = LOWER(p.email);

-- 3. Actualizar la política RLS de SELECT en course_enrollments
-- Permite que el estudiante consulte sus inscripciones tanto por su user_id como por su email verificado en el token auth
DROP POLICY IF EXISTS enrollments_select_own ON public.course_enrollments;
CREATE POLICY enrollments_select_own ON public.course_enrollments
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR LOWER(email) = LOWER((SELECT auth.jwt() ->> 'email'))
  );

-- 4. Actualizar la política RLS de UPDATE para permitir vinculación por el propio usuario
DROP POLICY IF EXISTS enrollments_update_own ON public.course_enrollments;
CREATE POLICY enrollments_update_own ON public.course_enrollments
  FOR UPDATE TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR (user_id IS NULL AND LOWER(email) = LOWER((SELECT auth.jwt() ->> 'email')))
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
  );

-- 5. Trigger automático: cuando un nuevo usuario se registra en auth/profiles, auto-vincular sus inscripciones huérfanas
CREATE OR REPLACE FUNCTION public.auto_link_enrollments_on_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email <> '' THEN
    UPDATE public.course_enrollments
    SET user_id = NEW.id
    WHERE user_id IS NULL
      AND LOWER(email) = LOWER(NEW.email);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_link_enrollments ON public.profiles;
CREATE TRIGGER trigger_auto_link_enrollments
  AFTER INSERT OR UPDATE OF email ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_link_enrollments_on_profile();

-- 6. Trigger automático: cuando el admin inscribe a un estudiante manualmente, si el correo ya pertenece a un perfil, asociar su user_id de inmediato
CREATE OR REPLACE FUNCTION public.auto_link_user_on_enrollment_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.user_id IS NULL AND NEW.email IS NOT NULL AND NEW.email <> '' THEN
    SELECT id INTO NEW.user_id
    FROM public.profiles
    WHERE LOWER(email) = LOWER(NEW.email)
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_link_user_on_enrollment ON public.course_enrollments;
CREATE TRIGGER trigger_auto_link_user_on_enrollment
  BEFORE INSERT ON public.course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_link_user_on_enrollment_insert();
