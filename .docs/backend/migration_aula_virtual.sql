-- =====================================================================
-- FUNDACIÓN PRINCIPIO & FIN — MIGRACIÓN AULA VIRTUAL
-- =====================================================================
-- Solo agrega las columnas necesarias a las tablas existentes.
-- Es idempotente: se puede ejecutar varias veces sin problema
-- (si ya corriste la versión anterior, este script corrige sus valores
-- por defecto de prueba).
-- Ejecutar en Supabase > SQL Editor.
-- =====================================================================

-- 1. Cursos: cohorte y docente formador
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS cohort text,
  ADD COLUMN IF NOT EXISTS instructor_name text;

ALTER TABLE public.courses
  ALTER COLUMN cohort DROP DEFAULT,
  ALTER COLUMN instructor_name DROP DEFAULT;

-- 2. Inscripciones: tipo de cupo, motivación, asistencia, promedio, retiro y certificado
ALTER TABLE public.course_enrollments
  ADD COLUMN IF NOT EXISTS cupo_type text DEFAULT 'Cupo Regular',
  ADD COLUMN IF NOT EXISTS motivation text,
  ADD COLUMN IF NOT EXISTS withdrawal_reason text,
  ADD COLUMN IF NOT EXISTS withdrawal_date timestamptz,
  ADD COLUMN IF NOT EXISTS attended_sessions int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS average_grade numeric(3,2),
  ADD COLUMN IF NOT EXISTS has_certificate boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS certificate_code text,
  ADD COLUMN IF NOT EXISTS certificate_issued_at timestamptz;

ALTER TABLE public.course_enrollments
  ALTER COLUMN attended_sessions SET DEFAULT 0,
  ALTER COLUMN average_grade DROP DEFAULT;

-- 3. Asignaciones: ponderación %, rúbrica (JSONB), guía adjunta y fecha de publicación
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS weight_percent int CHECK (weight_percent IS NULL OR weight_percent BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS rubric_criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS attachment_url text,          -- ruta en el bucket course-materials
  ADD COLUMN IF NOT EXISTS publish_at timestamptz DEFAULT now();

ALTER TABLE public.assignments
  ALTER COLUMN weight_percent DROP DEFAULT;

-- 4. Entregas: vínculo a inscripción, título, notas por criterio, nota de corrección y mención
ALTER TABLE public.submissions
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS enrollment_id uuid REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS project_title text,
  ADD COLUMN IF NOT EXISTS rubric_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS correction_note text,
  ADD COLUMN IF NOT EXISTS badge text;

CREATE INDEX IF NOT EXISTS submissions_enrollment_idx ON public.submissions (enrollment_id);

-- 5. Archivos de entrega: URL directa opcional (además de storage_path)
ALTER TABLE public.submission_files
  ADD COLUMN IF NOT EXISTS url text;

-- ---------------------------------------------------------------------
-- 6. Limpieza de la versión anterior de este script (valores de prueba)
-- ---------------------------------------------------------------------
UPDATE public.courses SET instructor_name = NULL WHERE instructor_name = 'Maestra Lucía Forero';
UPDATE public.courses SET cohort = NULL WHERE cohort = '2026-I';

-- El % de asistencia ahora se calcula (attended_sessions / courses.total_sessions)
ALTER TABLE public.course_enrollments
  DROP COLUMN IF EXISTS attendance_percentage,
  DROP COLUMN IF EXISTS total_sessions;
