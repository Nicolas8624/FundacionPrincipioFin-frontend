-- =====================================================================
-- FUNDACIÓN PRINCIPIO & FIN — ESQUEMA COMPLETO DE BASE DE DATOS
-- =====================================================================
-- Archivo: 01_esquema_completo.sql
-- Descripción:
--   Crea la estructura unificada completa de la base de datos en Supabase:
--   - Tipos ENUM personalizados
--   - Funciones auxiliares y disparadores (triggers)
--   - 14 tablas completas e integradas
--   - Índices de rendimiento
--   - Políticas de Seguridad de Fila (Row Level Security - RLS)
--   - Buckets de Almacenamiento (Supabase Storage) y sus políticas
--
-- Ejecución:
--   Ejecutar este script en Supabase > SQL Editor en una base de datos nueva
--   o existente. Es idempotente (se puede ejecutar varias veces con seguridad).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. EXTENSIONES REQUERIDAS
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- 2. TIPOS ENUM PERSONALIZADOS
-- ---------------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'docente', 'coordinador');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_modality') THEN
    CREATE TYPE public.course_modality AS ENUM ('presencial', 'virtual', 'hibrido');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_status') THEN
    CREATE TYPE public.content_status AS ENUM ('borrador', 'publicado', 'archivado');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_status') THEN
    CREATE TYPE public.enrollment_status AS ENUM ('pendiente', 'confirmada', 'rechazada', 'cancelada', 'completada', 'aprobada');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
    CREATE TYPE public.submission_status AS ENUM ('borrador', 'entregada', 'calificada', 'requiere_cambios');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ph_request_status') THEN
    CREATE TYPE public.ph_request_status AS ENUM ('pendiente', 'en_revision', 'aprobada', 'rechazada');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'donation_status') THEN
    CREATE TYPE public.donation_status AS ENUM ('nueva', 'contactado', 'concretada', 'cancelada');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_status') THEN
    CREATE TYPE public.contact_status AS ENUM ('nuevo', 'leido', 'respondido', 'archivado');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gallery_item_type') THEN
    CREATE TYPE public.gallery_item_type AS ENUM ('image', 'video');
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 3. FUNCIONES AUXILIARES GLOBALES
-- ---------------------------------------------------------------------

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función de seguridad para comprobar si el usuario conectado es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'coordinador')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Trigger para crear perfil automáticamente al registrar usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role)
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------
-- 4. TABLAS PRINCIPALES (14 TABLAS)
-- ---------------------------------------------------------------------

-- Tabla 1: Perfiles de Usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text UNIQUE NOT NULL,
  full_name       text,
  role            public.user_role NOT NULL DEFAULT 'user',
  phone           text,
  avatar_url      text,
  locality        text,
  document_type   text CHECK (document_type IS NULL OR document_type IN ('CC','TI','CE','PA','RC','Otro')),
  document_number text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tabla 2: Categorías de Cursos
CREATE TABLE IF NOT EXISTS public.course_categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  name          text NOT NULL,
  description   text,
  icon_name     text,
  accent_color  text,
  sort_order    int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS categories_updated_at ON public.course_categories;
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.course_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tabla 3: Cursos y Talleres
CREATE TABLE IF NOT EXISTS public.courses (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id        uuid REFERENCES public.course_categories(id) ON DELETE SET NULL,
  slug               text UNIQUE NOT NULL,
  title              text NOT NULL,
  description        text,
  short_description  text,
  modality           public.course_modality NOT NULL DEFAULT 'presencial',
  status             public.content_status NOT NULL DEFAULT 'publicado',
  capacity           int CHECK (capacity IS NULL OR capacity >= 0),
  cohort             text,
  instructor_name    text,
  total_sessions     int NOT NULL DEFAULT 16,
  schedule_text      text,
  location           text,
  image_url          text,
  start_date         date,
  end_date           date,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS courses_updated_at ON public.courses;
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tabla 4: Inscripciones a Cursos (Matrículas)
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id              uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id                uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name              text NOT NULL,
  document_type          text CHECK (document_type IS NULL OR document_type IN ('CC','TI','CE','PA','RC','Otro')),
  document_number        text,
  email                  text NOT NULL,
  phone                  text,
  locality               text,
  cupo_type              text DEFAULT 'Cupo Regular',
  motivation             text,
  status                 public.enrollment_status NOT NULL DEFAULT 'pendiente',
  attended_sessions      int NOT NULL DEFAULT 0,
  average_grade          numeric(3,2),
  has_certificate        boolean NOT NULL DEFAULT false,
  certificate_code       text,
  certificate_issued_at  timestamptz,
  withdrawal_reason      text,
  withdrawal_date        timestamptz,
  accepted_data_policy   boolean NOT NULL DEFAULT false,
  admin_notes            text,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS enrollments_updated_at ON public.course_enrollments;
CREATE TRIGGER enrollments_updated_at BEFORE UPDATE ON public.course_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tabla 5: Módulos de Cursos
CREATE TABLE IF NOT EXISTS public.course_modules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS modules_updated_at ON public.course_modules;
CREATE TRIGGER modules_updated_at BEFORE UPDATE ON public.course_modules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tabla 6: Materiales Didácticos de Cursos
CREATE TABLE IF NOT EXISTS public.course_materials (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id     uuid REFERENCES public.course_modules(id) ON DELETE SET NULL,
  title         text NOT NULL,
  description   text,
  url           text,
  storage_path  text,
  type          text,
  sort_order    int NOT NULL DEFAULT 0,
  is_published  boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Asegurar columnas si la tabla ya existía
ALTER TABLE public.course_materials ADD COLUMN IF NOT EXISTS url text;
ALTER TABLE public.course_materials ADD COLUMN IF NOT EXISTS storage_path text;
ALTER TABLE public.course_materials ADD COLUMN IF NOT EXISTS type text;

DROP TRIGGER IF EXISTS materials_updated_at ON public.course_materials;
CREATE TRIGGER materials_updated_at BEFORE UPDATE ON public.course_materials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tabla 7: Asignaciones y Actividades
CREATE TABLE IF NOT EXISTS public.assignments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id       uuid REFERENCES public.course_modules(id) ON DELETE SET NULL,
  title           text NOT NULL,
  instructions    text,
  due_at          timestamptz,
  weight_percent  int CHECK (weight_percent IS NULL OR weight_percent BETWEEN 0 AND 100),
  max_score       numeric(6,2) NOT NULL DEFAULT 5.00,
  rubric_criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
  attachment_url  text,
  publish_at      timestamptz DEFAULT now(),
  allow_text      boolean NOT NULL DEFAULT true,
  allow_files     boolean NOT NULL DEFAULT true,
  allow_late      boolean NOT NULL DEFAULT false,
  is_published    boolean NOT NULL DEFAULT false,
  created_by      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS assignments_updated_at ON public.assignments;
CREATE TRIGGER assignments_updated_at BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tabla 8: Entregas de Actividades (Submissions)
CREATE TABLE IF NOT EXISTS public.submissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id   uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id         uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrollment_id   uuid REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  project_title   text,
  text_content    text,
  status          public.submission_status NOT NULL DEFAULT 'borrador',
  submitted_at    timestamptz,
  is_late         boolean NOT NULL DEFAULT false,
  score           numeric(6,2),
  rubric_scores   jsonb NOT NULL DEFAULT '{}'::jsonb,
  feedback        text,
  correction_note text,
  badge           text,
  graded_by       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  graded_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, user_id)
);

DROP TRIGGER IF EXISTS submissions_updated_at ON public.submissions;
CREATE TRIGGER submissions_updated_at BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tabla 9: Archivos Adjuntos de Entregas
CREATE TABLE IF NOT EXISTS public.submission_files (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id  uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  storage_path   text NOT NULL,
  file_name      text NOT NULL,
  mime_type      text,
  size_bytes     bigint,
  url            text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Tabla 10: Progreso en Materiales Didácticos
CREATE TABLE IF NOT EXISTS public.material_progress (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id   uuid NOT NULL REFERENCES public.course_materials(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed     boolean NOT NULL DEFAULT false,
  completed_at  timestamptz,
  UNIQUE (material_id, user_id)
);

-- Tabla 11: Solicitudes de Propiedad Horizontal (PH)
CREATE TABLE IF NOT EXISTS public.ph_requests (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  administrator_name    text NOT NULL,
  role_title            text,
  complex_name          text NOT NULL,
  address               text NOT NULL,
  locality              text NOT NULL,
  phone                 text NOT NULL,
  email                 text NOT NULL,
  residents_count       int,
  message               text NOT NULL,
  accepted_data_policy  boolean NOT NULL DEFAULT false,
  status                public.ph_request_status NOT NULL DEFAULT 'pendiente',
  admin_notes           text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS ph_requests_updated_at ON public.ph_requests;
CREATE TRIGGER ph_requests_updated_at BEFORE UPDATE ON public.ph_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tabla 12: Solicitudes y Registros de Donaciones
CREATE TABLE IF NOT EXISTS public.donation_requests (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  donor_name            text NOT NULL,
  donation_type         text NOT NULL,
  phone                 text NOT NULL,
  email                 text NOT NULL,
  message               text NOT NULL,
  accepted_data_policy  boolean NOT NULL DEFAULT false,
  status                public.donation_status NOT NULL DEFAULT 'nueva',
  amount_cop            numeric(12,2),
  admin_notes           text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS donations_updated_at ON public.donation_requests;
CREATE TRIGGER donations_updated_at BEFORE UPDATE ON public.donation_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tabla 13: Mensajes de Contacto y PQRS
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name                  text NOT NULL,
  email                 text NOT NULL,
  phone                 text,
  subject               text NOT NULL,
  message               text NOT NULL,
  accepted_data_policy  boolean NOT NULL DEFAULT false,
  status                public.contact_status NOT NULL DEFAULT 'nuevo',
  admin_notes           text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS contact_updated_at ON public.contact_messages;
CREATE TRIGGER contact_updated_at BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tabla 14: Galería Institucional y Memorias
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  section     text NOT NULL DEFAULT 'general',
  type        text NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
  url         text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ---------------------------------------------------------------------
-- 5. ÍNDICES DE RENDIMIENTO
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_email ON public.course_enrollments(email);
CREATE INDEX IF NOT EXISTS idx_modules_course ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON public.assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_module ON public.assignments(module_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_enrollment ON public.submissions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_submission_files_sub ON public.submission_files(submission_id);
CREATE INDEX IF NOT EXISTS idx_ph_requests_user ON public.ph_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_ph_requests_email ON public.ph_requests(email);
CREATE INDEX IF NOT EXISTS idx_donations_user ON public.donation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_email ON public.donation_requests(email);
CREATE INDEX IF NOT EXISTS idx_contact_user ON public.contact_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_email ON public.contact_messages(email);

-- ---------------------------------------------------------------------
-- 6. POLÍTICAS ROW LEVEL SECURITY (RLS)
-- ---------------------------------------------------------------------
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_files    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ph_requests         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_requests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items       ENABLE ROW LEVEL SECURITY;

-- 6.1 Profiles
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;
CREATE POLICY profiles_select_admin ON public.profiles FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS profiles_update_admin ON public.profiles;
CREATE POLICY profiles_update_admin ON public.profiles FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

-- 6.2 Cursos y Categorías
DROP POLICY IF EXISTS courses_select_pub ON public.courses;
CREATE POLICY courses_select_pub ON public.courses FOR SELECT TO anon, authenticated
  USING (status <> 'archivado');

DROP POLICY IF EXISTS courses_admin_all ON public.courses;
CREATE POLICY courses_admin_all ON public.courses FOR ALL TO authenticated
  USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS categories_select_pub ON public.course_categories;
CREATE POLICY categories_select_pub ON public.course_categories FOR SELECT TO anon, authenticated
  USING (true);

-- 6.3 Inscripciones a Cursos
DROP POLICY IF EXISTS enrollments_insert_pub ON public.course_enrollments;
CREATE POLICY enrollments_insert_pub ON public.course_enrollments FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS enrollments_select_own ON public.course_enrollments;
CREATE POLICY enrollments_select_own ON public.course_enrollments FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR LOWER(email) = LOWER((SELECT auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS enrollments_admin_all ON public.course_enrollments;
CREATE POLICY enrollments_admin_all ON public.course_enrollments FOR ALL TO authenticated
  USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

-- 6.4 Módulos y Materiales
DROP POLICY IF EXISTS modules_select_all ON public.course_modules;
CREATE POLICY modules_select_all ON public.course_modules FOR SELECT TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS materials_select_all ON public.course_materials;
CREATE POLICY materials_select_all ON public.course_materials FOR SELECT TO authenticated, anon
  USING (is_published = true OR (SELECT public.is_admin()));

-- 6.5 Asignaciones y Actividades
DROP POLICY IF EXISTS assignments_select_all ON public.assignments;
CREATE POLICY assignments_select_all ON public.assignments FOR SELECT TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS assignments_admin_all ON public.assignments;
CREATE POLICY assignments_admin_all ON public.assignments FOR ALL TO authenticated
  USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

-- 6.6 Entregas (Submissions)
DROP POLICY IF EXISTS submissions_own_select ON public.submissions;
CREATE POLICY submissions_own_select ON public.submissions FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS submissions_own_insert ON public.submissions;
CREATE POLICY submissions_own_insert ON public.submissions FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS submissions_own_update ON public.submissions;
CREATE POLICY submissions_own_update ON public.submissions FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
  WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

-- 6.7 Archivos de Entregas
DROP POLICY IF EXISTS sub_files_select ON public.submission_files;
CREATE POLICY sub_files_select ON public.submission_files FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS sub_files_insert ON public.submission_files;
CREATE POLICY sub_files_insert ON public.submission_files FOR INSERT TO authenticated
  WITH CHECK (true);

-- 6.8 Progreso en Materiales
DROP POLICY IF EXISTS progress_select_own ON public.material_progress;
CREATE POLICY progress_select_own ON public.material_progress FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

-- 6.9 Solicitudes PH
DROP POLICY IF EXISTS ph_insert_pub ON public.ph_requests;
CREATE POLICY ph_insert_pub ON public.ph_requests FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pendiente' AND (user_id IS NULL OR user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS ph_select_own ON public.ph_requests;
CREATE POLICY ph_select_own ON public.ph_requests FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR LOWER(email) = LOWER((SELECT auth.jwt() ->> 'email')) OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS ph_admin_all ON public.ph_requests;
CREATE POLICY ph_admin_all ON public.ph_requests FOR ALL TO authenticated
  USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

-- 6.10 Donaciones
DROP POLICY IF EXISTS donations_insert_pub ON public.donation_requests;
CREATE POLICY donations_insert_pub ON public.donation_requests FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'nueva' AND (user_id IS NULL OR user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS donations_select_own ON public.donation_requests;
CREATE POLICY donations_select_own ON public.donation_requests FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR LOWER(email) = LOWER((SELECT auth.jwt() ->> 'email')) OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS donations_admin_all ON public.donation_requests;
CREATE POLICY donations_admin_all ON public.donation_requests FOR ALL TO authenticated
  USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

-- 6.11 Contacto / PQRS
DROP POLICY IF EXISTS contact_insert_pub ON public.contact_messages;
CREATE POLICY contact_insert_pub ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'nuevo' AND (user_id IS NULL OR user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS contact_select_own ON public.contact_messages;
CREATE POLICY contact_select_own ON public.contact_messages FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR LOWER(email) = LOWER((SELECT auth.jwt() ->> 'email')) OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS contact_admin_all ON public.contact_messages;
CREATE POLICY contact_admin_all ON public.contact_messages FOR ALL TO authenticated
  USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

-- 6.12 Galería Institucional
DROP POLICY IF EXISTS gallery_select_pub ON public.gallery_items;
CREATE POLICY gallery_select_pub ON public.gallery_items FOR SELECT USING (true);

DROP POLICY IF EXISTS gallery_admin_all ON public.gallery_items;
CREATE POLICY gallery_admin_all ON public.gallery_items FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------
-- 7. BUCKETS DE ALMACENAMIENTO (STORAGE)
-- ---------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('submissions', 'submissions', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('course-materials', 'course-materials', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-avatars', 'profile-avatars', true) ON CONFLICT (id) DO NOTHING;

-- Políticas del Bucket Gallery
DROP POLICY IF EXISTS "Lectura publica del bucket gallery" ON storage.objects;
CREATE POLICY "Lectura publica del bucket gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Carga de archivos en gallery para autenticados" ON storage.objects;
CREATE POLICY "Carga de archivos en gallery para autenticados" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Eliminacion de archivos en gallery para autenticados" ON storage.objects;
CREATE POLICY "Eliminacion de archivos en gallery para autenticados" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery');

-- Políticas del Bucket Course Materials
DROP POLICY IF EXISTS "Lectura publica course materials" ON storage.objects;
CREATE POLICY "Lectura publica course materials" ON storage.objects FOR SELECT USING (bucket_id = 'course-materials');

DROP POLICY IF EXISTS "Admin gestiona course materials" ON storage.objects;
CREATE POLICY "Admin gestiona course materials" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'course-materials') WITH CHECK (bucket_id = 'course-materials');

-- Políticas del Bucket Submissions
DROP POLICY IF EXISTS "Carga y descarga en submissions" ON storage.objects;
CREATE POLICY "Carga y descarga en submissions" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'submissions') WITH CHECK (bucket_id = 'submissions');

-- Políticas del Bucket Profile Avatars
DROP POLICY IF EXISTS "Lectura publica profile avatars" ON storage.objects;
CREATE POLICY "Lectura publica profile avatars" ON storage.objects FOR SELECT USING (bucket_id = 'profile-avatars');

DROP POLICY IF EXISTS "Usuario gestiona su avatar" ON storage.objects;
CREATE POLICY "Usuario gestiona su avatar" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'profile-avatars') WITH CHECK (bucket_id = 'profile-avatars');
