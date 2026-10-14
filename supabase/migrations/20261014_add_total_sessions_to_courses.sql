-- =====================================================================
-- MIGRACIÓN: AGREGAR TOTAL_SESSIONS A LA TABLA COURSES
-- =====================================================================
-- Permite calcular de forma dinámica el porcentaje de asistencia:
-- (course_enrollments.attended_sessions / courses.total_sessions) * 100
-- Ejecutar en Supabase > SQL Editor
-- =====================================================================

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS total_sessions int DEFAULT 16;

COMMENT ON COLUMN public.courses.total_sessions IS 'Número total de sesiones prácticas o clases programadas para el curso';
