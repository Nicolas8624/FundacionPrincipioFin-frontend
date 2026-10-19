-- =====================================================================
-- TABLA: TABLERO DE ANUNCIOS Y COMUNIDAD (announcements)
-- =====================================================================
-- Fundación Principio & Fin
-- Permite a los coordinadores y administradores publicar novedades,
-- convocatorias y circulares institucionales para estudiantes y PH.
-- Ejecutar en Supabase > SQL Editor
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.announcements (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  content          text NOT NULL,
  category         text NOT NULL DEFAULT 'general', -- 'general', 'ph', 'academico', 'evento'
  target_audience  text NOT NULL DEFAULT 'Comunidad en General',
  is_pinned        boolean NOT NULL DEFAULT false,
  status           text NOT NULL DEFAULT 'publicado', -- 'publicado', 'borrador'
  author_id        uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Trigger para updated_at automático
DROP TRIGGER IF EXISTS announcements_updated_at ON public.announcements;
CREATE TRIGGER announcements_updated_at BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 1. Políticas de Lectura (SELECT):
-- Usuarios autenticados pueden ver anuncios publicados (y administradores ven todos)
DROP POLICY IF EXISTS "announcements_read_authenticated" ON public.announcements;
CREATE POLICY "announcements_read_authenticated" ON public.announcements
  FOR SELECT TO authenticated
  USING (status = 'publicado' OR public.is_admin());

-- Visitantes y anónimos
DROP POLICY IF EXISTS "announcements_read_anon" ON public.announcements;
CREATE POLICY "announcements_read_anon" ON public.announcements
  FOR SELECT TO anon
  USING (status = 'publicado');

-- 2. Políticas de Escritura (INSERT, UPDATE, DELETE):
-- Exclusivo para administradores de la Fundación
DROP POLICY IF EXISTS "announcements_admin_insert" ON public.announcements;
CREATE POLICY "announcements_admin_insert" ON public.announcements
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "announcements_admin_update" ON public.announcements;
CREATE POLICY "announcements_admin_update" ON public.announcements
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "announcements_admin_delete" ON public.announcements;
CREATE POLICY "announcements_admin_delete" ON public.announcements
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Semillas iniciales si la tabla está vacía
INSERT INTO public.announcements (title, content, category, target_audience, is_pinned, status)
SELECT 
  'Apertura de Convocatoria Talleres Comunitarios II Semestre',
  'Se informa a todas las administraciones de propiedad horizontal y estudiantes que inician las inscripciones para los nuevos ciclos formativos en arte, telar y cerámica comunitaria.',
  'ph',
  'Conjuntos Residenciales y Estudiantes',
  true,
  'publicado'
WHERE NOT EXISTS (SELECT 1 FROM public.announcements);

INSERT INTO public.announcements (title, content, category, target_audience, is_pinned, status)
SELECT 
  'Jornada de Mantenimiento Preventivo del Aula Virtual',
  'Este fin de semana se realizarán labores de optimización en la plataforma académica. Las entregas de actividades mantendrán su plazo habitual.',
  'academico',
  'Estudiantes del Portal',
  false,
  'publicado'
WHERE (SELECT COUNT(*) FROM public.announcements) < 2;

INSERT INTO public.announcements (title, content, category, target_audience, is_pinned, status)
SELECT 
  'Feria Comunitaria de Emprendimiento y Creatividad',
  'Invitamos a las familias y egresados a la exposición artesanal de fin de trimestre en el domo cultural de la Fundación. Entrada libre para residentes y aliados.',
  'evento',
  'Comunidad en General',
  false,
  'publicado'
WHERE (SELECT COUNT(*) FROM public.announcements) < 3;