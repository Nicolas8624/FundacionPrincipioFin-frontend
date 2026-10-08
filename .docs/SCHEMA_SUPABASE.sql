-- ==============================================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS Y POLÍTICAS RLS PARA SUPABASE
-- PROYECTO: Fundación Principio & Fin
-- ==============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tipos de datos (ENUMS)
CREATE TYPE public.user_role AS ENUM ('admin', 'superadmin', 'user');
CREATE TYPE public.course_status AS ENUM ('publicado', 'borrador');
CREATE TYPE public.request_status AS ENUM ('pendiente', 'en revision', 'aprobada');
CREATE TYPE public.message_status AS ENUM ('nuevo', 'leido', 'respondido');
CREATE TYPE public.donation_status AS ENUM ('pendiente', 'gestionado');

-- ==========================================
-- CREACIÓN DE TABLAS
-- ==========================================

-- Tabla 1: Perfiles (Extensión de auth.users de Supabase)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role public.user_role DEFAULT 'user' NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabla 2: Cursos / Oferta Formativa
CREATE TABLE public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    short_description TEXT,
    category TEXT NOT NULL,
    schedule TEXT,
    capacity INT DEFAULT 0,
    enrolled_count INT DEFAULT 0,
    status public.course_status DEFAULT 'borrador' NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabla 3: Gestor de Contenido Dinámico (CMS)
CREATE TABLE public.site_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section_key TEXT UNIQUE NOT NULL,
    content JSONB DEFAULT '{}'::jsonb NOT NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabla 4: Módulos de los cursos
CREATE TABLE public.course_modules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    "order" INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabla 5: Lecciones de los cursos
CREATE TABLE public.course_lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    video_url TEXT,
    content_text TEXT,
    "order" INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabla 6: Inscripciones de usuarios
CREATE TABLE public.enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    document_number TEXT NOT NULL,
    birth_date DATE,
    phone TEXT,
    email TEXT,
    locality TEXT,
    guardian_name TEXT,
    accepted_data_policy BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabla 7: Progreso del usuario en las lecciones
CREATE TABLE public.user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, lesson_id)
);

-- Tabla 8: Solicitudes de Propiedad Horizontal
CREATE TABLE public.ph_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_name TEXT NOT NULL,
    role TEXT NOT NULL,
    residential_name TEXT NOT NULL,
    address_locality TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    residents_approx TEXT,
    message TEXT,
    accepted_data_policy BOOLEAN DEFAULT false NOT NULL,
    status public.request_status DEFAULT 'pendiente' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabla 9: Mensajes de Contacto
CREATE TABLE public.contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    accepted_data_policy BOOLEAN DEFAULT false NOT NULL,
    status public.message_status DEFAULT 'nuevo' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabla 10: Donaciones y Alianzas
CREATE TABLE public.donations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name_or_company TEXT NOT NULL,
    donation_type TEXT NOT NULL,
    phone TEXT,
    email TEXT NOT NULL,
    message TEXT,
    accepted_data_policy BOOLEAN DEFAULT false NOT NULL,
    status public.donation_status DEFAULT 'pendiente' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- POLÍTICAS DE SEGURIDAD RLS (Row Level Security)
-- ==========================================

-- Activar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ph_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Funciones auxiliares para verificar roles (opcional pero util para RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins ven todos los perfiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. COURSES
CREATE POLICY "Cursos publicados visibles para todos" ON public.courses FOR SELECT USING (status = 'publicado' OR public.is_admin());
CREATE POLICY "Admins tienen control total de cursos" ON public.courses FOR ALL USING (public.is_admin());

-- 3. SITE CONTENT (CMS)
CREATE POLICY "Contenido CMS visible para todos" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins tienen control total del CMS" ON public.site_content FOR ALL USING (public.is_admin());

-- 4 y 5. MODULES & LESSONS
CREATE POLICY "Modulos y lecciones publicas de cursos publicados" ON public.course_modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND (status = 'publicado' OR public.is_admin()))
);
CREATE POLICY "Admins tienen control total de modulos" ON public.course_modules FOR ALL USING (public.is_admin());

CREATE POLICY "Lecciones visibles según curso" ON public.course_lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.course_modules m JOIN public.courses c ON m.course_id = c.id WHERE m.id = module_id AND (c.status = 'publicado' OR public.is_admin()))
);
CREATE POLICY "Admins tienen control total de lecciones" ON public.course_lessons FOR ALL USING (public.is_admin());

-- 6. ENROLLMENTS
CREATE POLICY "Visitantes pueden insertar inscripciones" ON public.enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Usuarios logueados ven sus inscripciones" ON public.enrollments FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Admins tienen control total de inscripciones" ON public.enrollments FOR ALL USING (public.is_admin());

-- 7. USER PROGRESS
CREATE POLICY "Usuarios ven/modifican su propio progreso" ON public.user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins ven el progreso de todos" ON public.user_progress FOR SELECT USING (public.is_admin());

-- 8, 9, 10. FORMULARIOS PUBLICOS (PH, Contacto, Donaciones)
-- Insertar publico
CREATE POLICY "Visitantes pueden enviar solicitudes PH" ON public.ph_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Visitantes pueden enviar mensajes contacto" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Visitantes pueden enviar donaciones" ON public.donations FOR INSERT WITH CHECK (true);

-- Leer y Modificar solo administradores
CREATE POLICY "Admins controlan solicitudes PH" ON public.ph_requests FOR ALL USING (public.is_admin());
CREATE POLICY "Admins controlan mensajes de contacto" ON public.contact_messages FOR ALL USING (public.is_admin());
CREATE POLICY "Admins controlan donaciones" ON public.donations FOR ALL USING (public.is_admin());

-- Disparador (Trigger) para crear perfil automáticamente al registrarse en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
