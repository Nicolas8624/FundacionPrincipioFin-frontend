-- =====================================================================
-- MIGRACIÓN: VISIBILIDAD DE CURSOS EN CATÁLOGO Y SINCRONIZACIÓN DE IMAGEN
-- =====================================================================
-- Fundación Principio & Fin
-- Ejecutar en Supabase > SQL Editor para asegurar que todos los cursos activos
-- creados en la base de datos se muestren en el catálogo y su imagen sea editable.
-- =====================================================================

-- 1. Asegurar que la columna img_url exista (por compatibilidad) y se sincronice con image_url
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS img_url text;

UPDATE public.courses
SET img_url = image_url
WHERE img_url IS NULL AND image_url IS NOT NULL;

UPDATE public.courses
SET image_url = img_url
WHERE image_url IS NULL AND img_url IS NOT NULL;

-- 2. Asegurar que los cursos existentes que estaban en 'borrador' pasen a 'publicado'
-- para que estén formalmente abiertos a los estudiantes
UPDATE public.courses
SET status = 'publicado'
WHERE status = 'borrador';

-- 3. Actualizar la política RLS para que los estudiantes autenticados puedan ver todos los cursos activos (no archivados)
DROP POLICY IF EXISTS courses_select_public ON public.courses;
CREATE POLICY courses_select_public ON public.courses
  FOR SELECT TO anon, authenticated
  USING (status != 'archivado');
