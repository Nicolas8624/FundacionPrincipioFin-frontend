-- =====================================================================
-- FUNDACIÓN PRINCIPIO & FIN — Base de datos (Supabase / PostgreSQL)
-- =====================================================================
-- Incluye: tipos, tablas, funciones auxiliares, triggers, políticas RLS,
-- vistas, buckets de Storage con sus políticas y datos iniciales.
--
-- USO: pegar completo en Supabase > SQL Editor y ejecutar UNA sola vez
-- en un proyecto nuevo. Para repetirlo, hay que borrar antes los objetos.
--
-- PRIMER ADMINISTRADOR: crear la cuenta desde Authentication > Users (o
-- registrándose en el sitio) y luego ejecutar en el SQL Editor:
--   update public.profiles set role = 'admin' where email = 'correo@dominio.org';
--
-- NOTAS DE SEGURIDAD
--  * El rol vive en public.profiles.role, NUNCA en user_metadata (el
--    usuario puede editar su propio user_metadata).
--  * Nunca usar la service_role key en el frontend.
--  * Los formularios públicos (inscripción, contacto, donaciones, PH)
--    aceptan inserts anónimos: se recomienda pasarlos por una ruta de
--    Next.js o Edge Function con CAPTCHA/rate limit para evitar spam.
--  * Nunca guardar secretos en site_settings (es de lectura pública).
-- =====================================================================


-- =====================================================================
-- 0. TIPOS (ENUM)
-- =====================================================================
create type public.user_role          as enum ('admin', 'user');
create type public.content_status     as enum ('borrador', 'publicado', 'archivado');
create type public.course_modality    as enum ('presencial', 'virtual', 'hibrido');
create type public.enrollment_status  as enum ('pendiente', 'confirmada', 'lista_espera', 'rechazada', 'cancelada', 'completada');
create type public.request_status     as enum ('pendiente', 'en_revision', 'aprobada', 'rechazada');
create type public.donation_type      as enum ('economico', 'insumos', 'equipos', 'patrocinio');
create type public.donation_status    as enum ('nueva', 'en_contacto', 'concretada', 'descartada');
create type public.message_status     as enum ('nuevo', 'leido', 'respondido', 'archivado');
create type public.material_type      as enum ('video', 'pdf', 'documento', 'enlace', 'imagen', 'texto');
create type public.submission_status  as enum ('borrador', 'entregada', 'calificada', 'devuelta');


-- =====================================================================
-- 1. FUNCIÓN UTILITARIA: updated_at
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


-- =====================================================================
-- 2. PERFILES (1 a 1 con auth.users)
-- =====================================================================
create table public.profiles (
  id                       uuid primary key references auth.users(id) on delete cascade,
  email                    text,                       -- copia informativa; la fuente de verdad es auth.users
  full_name                text,
  document_type            text check (document_type in ('CC','TI','CE','PA','RC','Otro')),
  document_number          text,
  birth_date               date,
  phone                    text,
  locality                 text,
  guardian_name            text,                       -- acudiente (menores de edad)
  avatar_url               text,
  role                     public.user_role not null default 'user',
  is_active                boolean not null default true,
  accepted_data_policy_at  timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ¿El usuario autenticado es administrador activo?
-- SECURITY DEFINER para evitar recursión de RLS al consultarse desde políticas.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.is_active
  );
$$;

-- Crear el perfil automáticamente al registrarse (el rol SIEMPRE arranca en 'user')
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, phone, accepted_data_policy_at)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    case when new.raw_user_meta_data ->> 'accepted_policy' = 'true' then now() end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mantener el correo del perfil sincronizado con auth.users
create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.sync_profile_email();

-- Un usuario normal NO puede cambiar su rol ni reactivarse a sí mismo.
-- (Desde el SQL Editor auth.uid() es null, por eso allí sí se puede promover un admin.)
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role      := old.role;
    new.is_active := old.is_active;
  end if;
  return new;
end;
$$;

create trigger profiles_protect before update on public.profiles
  for each row execute function public.protect_profile_fields();


-- =====================================================================
-- 3. CATEGORÍAS Y CURSOS
-- =====================================================================
create table public.course_categories (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  description   text,
  accent_color  text,                                   -- p. ej. '#2E7D32'
  sort_order    int  not null default 0,
  created_at    timestamptz not null default now()
);

create table public.courses (
  id                 uuid primary key default gen_random_uuid(),
  category_id        uuid references public.course_categories(id) on delete set null,
  slug               text not null unique,
  title              text not null,
  short_description  text,
  description        text,
  image_url          text,
  modality           public.course_modality not null default 'presencial',
  schedule_text      text,                              -- 'Sáb 9:00 a.m.'
  location           text,
  start_date         date,
  end_date           date,
  capacity           int check (capacity is null or capacity >= 0),   -- null = sin límite
  is_free            boolean not null default true,
  price_cop          numeric(12,2) check (price_cop is null or price_cop >= 0),
  min_age            int check (min_age is null or min_age >= 0),
  max_age            int,
  requirements       text,
  certificate_info   text,
  status             public.content_status not null default 'borrador',
  sort_order         int not null default 0,
  created_by         uuid references public.profiles(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date),
  check (max_age is null or min_age is null or max_age >= min_age)
);

create index courses_category_idx on public.courses (category_id);
create index courses_status_idx   on public.courses (status, sort_order);
create trigger courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 4. INSCRIPCIONES A CURSOS
-- =====================================================================
-- user_id es null cuando alguien se inscribe sin cuenta (cursos presenciales).
-- Los cursos virtuales exigen cuenta (ver política de inserción).
create table public.course_enrollments (
  id                       uuid primary key default gen_random_uuid(),
  course_id                uuid not null references public.courses(id) on delete cascade,
  user_id                  uuid references public.profiles(id) on delete set null,
  full_name                text not null check (char_length(full_name) between 3 and 150),
  document_type            text,
  document_number          text check (document_number is null or char_length(document_number) <= 30),
  birth_date               date,
  phone                    text check (phone is null or char_length(phone) <= 30),
  email                    text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  locality                 text,
  guardian_name            text,
  accepted_data_policy     boolean not null default false check (accepted_data_policy),
  status                   public.enrollment_status not null default 'pendiente',
  admin_notes              text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index enrollments_course_idx on public.course_enrollments (course_id, status);
create index enrollments_user_idx   on public.course_enrollments (user_id);
create unique index enrollments_unique_user
  on public.course_enrollments (course_id, user_id)
  where user_id is not null and status not in ('cancelada', 'rechazada');
create unique index enrollments_unique_document
  on public.course_enrollments (course_id, document_number)
  where document_number is not null and status not in ('cancelada', 'rechazada');
create trigger enrollments_updated_at before update on public.course_enrollments
  for each row execute function public.set_updated_at();

-- ¿El usuario autenticado tiene inscripción confirmada (o completada) en el curso?
create or replace function public.is_enrolled(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.course_enrollments e
    where e.course_id = p_course_id
      and e.user_id = auth.uid()
      and e.status in ('confirmada', 'completada')
  );
$$;

-- Cupos ocupados (función pública; no expone datos de las personas)
create or replace function public.course_seats_taken(p_course_id uuid)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::int from public.course_enrollments
  where course_id = p_course_id and status in ('confirmada', 'completada');
$$;

-- Validaciones de inscripción: menores con acudiente, cupos, y límites del usuario normal
create or replace function public.enrollments_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin boolean := public.is_admin();
  v_api   boolean := coalesce(auth.role(), '') in ('anon', 'authenticated');
  v_cap   int;
  v_taken int;
begin
  if tg_op = 'INSERT' then
    if new.birth_date is not null and new.birth_date > current_date then
      raise exception 'La fecha de nacimiento no es válida';
    end if;
    if new.birth_date is not null
       and new.birth_date > (current_date - interval '18 years')
       and coalesce(btrim(new.guardian_name), '') = '' then
      raise exception 'Se requiere el nombre del acudiente para menores de edad';
    end if;
    if v_api and not v_admin then
      new.status      := 'pendiente';
      new.admin_notes := null;
    end if;

  elsif tg_op = 'UPDATE' then
    if v_api and not v_admin then
      -- El usuario normal solo puede cancelar su propia inscripción
      if new.status <> 'cancelada' then
        raise exception 'Solo puedes cancelar tu inscripción';
      end if;
      new.course_id            := old.course_id;
      new.user_id              := old.user_id;
      new.full_name            := old.full_name;
      new.document_type        := old.document_type;
      new.document_number      := old.document_number;
      new.birth_date           := old.birth_date;
      new.phone                := old.phone;
      new.email                := old.email;
      new.locality             := old.locality;
      new.guardian_name        := old.guardian_name;
      new.accepted_data_policy := old.accepted_data_policy;
      new.admin_notes          := old.admin_notes;
    end if;

    if new.status = 'confirmada' and old.status is distinct from 'confirmada' then
      select capacity into v_cap from public.courses where id = new.course_id;
      if v_cap is not null then
        select count(*) into v_taken
        from public.course_enrollments
        where course_id = new.course_id
          and status in ('confirmada', 'completada')
          and id <> new.id;
        if v_taken >= v_cap then
          raise exception 'El curso no tiene cupos disponibles';
        end if;
      end if;
    end if;
  end if;

  return new;
end;
$$;

create trigger enrollments_guard_trg
  before insert or update on public.course_enrollments
  for each row execute function public.enrollments_guard();


-- =====================================================================
-- 5. FORMULARIOS PÚBLICOS: PROPIEDAD HORIZONTAL, DONACIONES, CONTACTO
-- =====================================================================
create table public.ph_requests (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references public.profiles(id) on delete set null,
  administrator_name    text not null check (char_length(administrator_name) between 3 and 150),
  role_title            text check (role_title in ('Administrador', 'Miembro del consejo', 'Otro')),
  complex_name          text not null check (char_length(complex_name) between 2 and 200),
  address               text,
  locality              text,
  phone                 text check (phone is null or char_length(phone) <= 30),
  email                 text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  residents_count       int check (residents_count is null or residents_count >= 0),
  message               text check (message is null or char_length(message) <= 2000),
  accepted_data_policy  boolean not null default false check (accepted_data_policy),
  status                public.request_status not null default 'pendiente',
  admin_notes           text,
  handled_by            uuid references public.profiles(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index ph_requests_status_idx on public.ph_requests (status, created_at desc);
create trigger ph_requests_updated_at before update on public.ph_requests
  for each row execute function public.set_updated_at();

create table public.donation_requests (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references public.profiles(id) on delete set null,
  donor_name            text not null check (char_length(donor_name) between 2 and 200),
  donation_type         public.donation_type not null,
  phone                 text check (phone is null or char_length(phone) <= 30),
  email                 text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message               text check (message is null or char_length(message) <= 2000),
  accepted_data_policy  boolean not null default false check (accepted_data_policy),
  status                public.donation_status not null default 'nueva',
  amount_cop            numeric(14,2) check (amount_cop is null or amount_cop >= 0),   -- lo registra el admin
  admin_notes           text,
  handled_by            uuid references public.profiles(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index donation_requests_status_idx on public.donation_requests (status, created_at desc);
create trigger donation_requests_updated_at before update on public.donation_requests
  for each row execute function public.set_updated_at();

create table public.contact_messages (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references public.profiles(id) on delete set null,
  name                  text not null check (char_length(name) between 2 and 150),
  email                 text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone                 text check (phone is null or char_length(phone) <= 30),
  subject               text not null default 'Otro'
                        check (subject in ('Inscripción a cursos', 'Propiedad horizontal', 'Donaciones y alianzas', 'Otro')),
  message               text not null check (char_length(message) between 5 and 2000),
  accepted_data_policy  boolean not null default false check (accepted_data_policy),
  status                public.message_status not null default 'nuevo',
  admin_notes           text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index contact_messages_status_idx on public.contact_messages (status, created_at desc);
create trigger contact_messages_updated_at before update on public.contact_messages
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 6. CONTENIDO EDITABLE DEL SITIO (CMS: inicio y otras páginas)
-- =====================================================================
-- Configuración global (contacto, redes, textos del footer...). Lectura pública.
create table public.site_settings (
  key          text primary key,
  value        jsonb not null default '{}'::jsonb,
  description  text,
  updated_by   uuid references public.profiles(id) on delete set null,
  updated_at   timestamptz not null default now()
);

-- Secciones de una página (hero, estadísticas, programas, beneficios, valores...)
create table public.site_sections (
  id                    uuid primary key default gen_random_uuid(),
  page                  text not null default 'home',     -- 'home', 'quienes-somos', ...
  section_key           text not null,                    -- 'hero', 'stats', 'programs', ...
  title                 text,
  subtitle              text,
  body                  text,
  image_url             text,
  primary_cta_label     text,
  primary_cta_url       text,
  secondary_cta_label   text,
  secondary_cta_url     text,
  is_visible            boolean not null default true,
  sort_order            int not null default 0,
  updated_by            uuid references public.profiles(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (page, section_key)
);

-- Elementos repetibles dentro de una sección (tarjetas, cifras, íconos, aliados...)
create table public.site_section_items (
  id           uuid primary key default gen_random_uuid(),
  section_id   uuid not null references public.site_sections(id) on delete cascade,
  title        text,
  description  text,
  value        text,                                      -- p. ej. '120+' en estadísticas
  icon         text,                                      -- nombre del ícono
  image_url    text,
  link_label   text,
  link_url     text,
  is_visible   boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index site_section_items_section_idx on public.site_section_items (section_id, sort_order);

create or replace function public.touch_updated_by()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_by();
create trigger site_sections_touch before update on public.site_sections
  for each row execute function public.touch_updated_by();
create trigger site_section_items_updated_at before update on public.site_section_items
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 7. AULA VIRTUAL (mini classroom)
-- =====================================================================
create table public.course_modules (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses(id) on delete cascade,
  title         text not null,
  description   text,
  sort_order    int not null default 0,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index course_modules_course_idx on public.course_modules (course_id, sort_order);
create trigger course_modules_updated_at before update on public.course_modules
  for each row execute function public.set_updated_at();

create table public.course_materials (
  id             uuid primary key default gen_random_uuid(),
  course_id      uuid not null references public.courses(id) on delete cascade,
  module_id      uuid references public.course_modules(id) on delete set null,
  title          text not null,
  description    text,
  type           public.material_type not null default 'documento',
  content_text   text,                                   -- para type = 'texto'
  url            text,                                   -- enlaces y videos externos (YouTube, Drive...)
  storage_path   text,                                   -- ruta dentro del bucket course-materials
  sort_order     int not null default 0,
  is_published   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index course_materials_course_idx on public.course_materials (course_id, module_id, sort_order);
create trigger course_materials_updated_at before update on public.course_materials
  for each row execute function public.set_updated_at();

create table public.assignments (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses(id) on delete cascade,
  module_id     uuid references public.course_modules(id) on delete set null,
  title         text not null,
  instructions  text,
  due_at        timestamptz,
  max_score     numeric(6,2) not null default 5.00 check (max_score > 0),   -- escala 0 a 5 por defecto
  allow_text    boolean not null default true,
  allow_files   boolean not null default true,
  allow_late    boolean not null default false,
  is_published  boolean not null default false,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index assignments_course_idx on public.assignments (course_id, due_at);
create trigger assignments_updated_at before update on public.assignments
  for each row execute function public.set_updated_at();

create table public.submissions (
  id             uuid primary key default gen_random_uuid(),
  assignment_id  uuid not null references public.assignments(id) on delete cascade,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  text_content   text,
  status         public.submission_status not null default 'borrador',
  submitted_at   timestamptz,
  is_late        boolean not null default false,
  score          numeric(6,2) check (score is null or score >= 0),
  feedback       text,
  graded_by      uuid references public.profiles(id) on delete set null,
  graded_at      timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (assignment_id, user_id)
);
create index submissions_user_idx   on public.submissions (user_id);
create index submissions_status_idx on public.submissions (status, submitted_at);
create trigger submissions_updated_at before update on public.submissions
  for each row execute function public.set_updated_at();

create table public.submission_files (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid not null references public.submissions(id) on delete cascade,
  storage_path   text not null,                          -- ruta en el bucket submissions: {user_id}/{assignment_id}/archivo
  file_name      text not null,
  mime_type      text,
  size_bytes     bigint check (size_bytes is null or size_bytes >= 0),
  created_at     timestamptz not null default now()
);
create index submission_files_submission_idx on public.submission_files (submission_id);

create table public.course_announcements (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses(id) on delete cascade,
  title         text not null,
  body          text,
  is_published  boolean not null default true,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index course_announcements_course_idx on public.course_announcements (course_id, created_at desc);
create trigger course_announcements_updated_at before update on public.course_announcements
  for each row execute function public.set_updated_at();

-- Progreso del estudiante (material marcado como visto/completado)
create table public.material_progress (
  user_id       uuid not null references public.profiles(id) on delete cascade,
  material_id   uuid not null references public.course_materials(id) on delete cascade,
  completed_at  timestamptz not null default now(),
  primary key (user_id, material_id)
);

-- Notificaciones dentro de la plataforma
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null,                              -- 'inscripcion', 'calificacion', ...
  title      text not null,
  body       text,
  link_url   text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, read_at, created_at desc);

-- ¿Está inscrito el usuario en el curso de esta actividad (y la actividad está publicada)?
create or replace function public.can_access_assignment(p_assignment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.assignments a
    where a.id = p_assignment_id
      and a.is_published
      and public.is_enrolled(a.course_id)
  );
$$;

-- ¿La entrega es del usuario y todavía puede editarse?
create or replace function public.can_edit_submission(p_submission_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.submissions s
    where s.id = p_submission_id
      and s.user_id = auth.uid()
      and s.status in ('borrador', 'devuelta')
  );
$$;

-- Reglas de entregas: el estudiante no toca la nota; fechas límite; calificación del admin
create or replace function public.submissions_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin boolean := public.is_admin();
  v_api   boolean := coalesce(auth.role(), '') in ('anon', 'authenticated');
  a       record;
begin
  select * into a from public.assignments where id = new.assignment_id;

  if tg_op = 'INSERT' then
    if v_api and not v_admin then
      new.score := null; new.feedback := null; new.graded_by := null; new.graded_at := null;
      if new.status not in ('borrador', 'entregada') then new.status := 'borrador'; end if;
    end if;
  else
    if v_api and not v_admin then
      new.assignment_id := old.assignment_id;
      new.user_id       := old.user_id;
      new.score         := old.score;
      new.feedback      := old.feedback;
      new.graded_by     := old.graded_by;
      new.graded_at     := old.graded_at;
      if old.status in ('entregada', 'calificada') then
        raise exception 'Esta entrega ya fue enviada y no se puede modificar';
      end if;
      if new.status not in ('borrador', 'entregada') then new.status := old.status; end if;
    end if;
  end if;

  -- Fecha y estado de envío
  if new.status = 'entregada' and (tg_op = 'INSERT' or old.status is distinct from 'entregada') then
    if v_api and not v_admin and a.due_at is not null and now() > a.due_at and not a.allow_late then
      raise exception 'La fecha límite de esta actividad ya venció';
    end if;
    new.submitted_at := now();
    new.is_late := (a.due_at is not null and now() > a.due_at);
  end if;

  -- Calificación (solo llega aquí con valor si la hizo un admin o el SQL Editor)
  if new.score is not null and (tg_op = 'INSERT' or new.score is distinct from old.score) then
    if new.score > a.max_score then
      raise exception 'La nota debe estar entre 0 y %', a.max_score;
    end if;
    new.status    := 'calificada';
    new.graded_by := coalesce(auth.uid(), new.graded_by);
    new.graded_at := now();
  end if;

  return new;
end;
$$;

create trigger submissions_guard_trg
  before insert or update on public.submissions
  for each row execute function public.submissions_guard();

-- Notificar al estudiante cuando le califican o le devuelven una entrega
create or replace function public.notify_submission_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_title text;
begin
  if new.status is distinct from old.status and new.status in ('calificada', 'devuelta') then
    select title into v_title from public.assignments where id = new.assignment_id;
    insert into public.notifications (user_id, type, title, body, link_url)
    values (
      new.user_id,
      'calificacion',
      case new.status when 'calificada' then 'Tu actividad fue calificada' else 'Tu actividad fue devuelta para ajustes' end,
      v_title,
      '/aula/actividades/' || new.assignment_id::text
    );
  end if;
  return new;
end;
$$;

create trigger submissions_notify_trg
  after update on public.submissions
  for each row execute function public.notify_submission_change();

-- Notificar al usuario cuando cambia el estado de su inscripción
create or replace function public.notify_enrollment_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_title text;
begin
  if new.user_id is not null
     and new.status is distinct from old.status
     and new.status in ('confirmada', 'rechazada', 'lista_espera') then
    select title into v_title from public.courses where id = new.course_id;
    insert into public.notifications (user_id, type, title, body, link_url)
    values (
      new.user_id,
      'inscripcion',
      case new.status
        when 'confirmada'   then 'Tu inscripción fue confirmada'
        when 'lista_espera' then 'Quedaste en lista de espera'
        else 'Tu inscripción no pudo ser aceptada'
      end,
      v_title,
      '/mi-panel/inscripciones'
    );
  end if;
  return new;
end;
$$;

create trigger enrollments_notify_trg
  after update on public.course_enrollments
  for each row execute function public.notify_enrollment_change();


-- =====================================================================
-- 8. ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles            enable row level security;
alter table public.course_categories   enable row level security;
alter table public.courses             enable row level security;
alter table public.course_enrollments  enable row level security;
alter table public.ph_requests         enable row level security;
alter table public.donation_requests   enable row level security;
alter table public.contact_messages    enable row level security;
alter table public.site_settings       enable row level security;
alter table public.site_sections       enable row level security;
alter table public.site_section_items  enable row level security;
alter table public.course_modules      enable row level security;
alter table public.course_materials    enable row level security;
alter table public.assignments         enable row level security;
alter table public.submissions         enable row level security;
alter table public.submission_files    enable row level security;
alter table public.course_announcements enable row level security;
alter table public.material_progress   enable row level security;
alter table public.notifications       enable row level security;

-- ---- profiles ----
create policy profiles_select_own   on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_select_admin on public.profiles for select to authenticated
  using ((select public.is_admin()));
create policy profiles_update_own   on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy profiles_update_admin on public.profiles for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
-- Sin políticas de insert/delete: el perfil se crea por trigger y se borra en cascada desde auth.users.

-- ---- course_categories ----
create policy categories_select_public on public.course_categories for select to anon, authenticated
  using (true);
create policy categories_admin_all on public.course_categories for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---- courses ----
create policy courses_select_public   on public.courses for select to anon, authenticated
  using (status = 'publicado');
create policy courses_select_enrolled on public.courses for select to authenticated
  using ((select public.is_enrolled(id)));
create policy courses_admin_all       on public.courses for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---- course_enrollments ----
create policy enrollments_insert_guest on public.course_enrollments for insert to anon
  with check (
    user_id is null
    and status = 'pendiente'
    and exists (select 1 from public.courses c
                where c.id = course_id and c.status = 'publicado' and c.modality in ('presencial', 'hibrido'))
  );
create policy enrollments_insert_own on public.course_enrollments for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'pendiente'
    and exists (select 1 from public.courses c where c.id = course_id and c.status = 'publicado')
  );
create policy enrollments_select_own   on public.course_enrollments for select to authenticated
  using (user_id = (select auth.uid()));
create policy enrollments_update_own   on public.course_enrollments for update to authenticated
  using (user_id = (select auth.uid()) and status in ('pendiente', 'confirmada', 'lista_espera'))
  with check (user_id = (select auth.uid()) and status = 'cancelada');
create policy enrollments_admin_all    on public.course_enrollments for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---- ph_requests ----
create policy ph_insert_public on public.ph_requests for insert to anon, authenticated
  with check (status = 'pendiente' and admin_notes is null and handled_by is null
              and (user_id is null or user_id = (select auth.uid())));
create policy ph_select_own    on public.ph_requests for select to authenticated
  using (user_id = (select auth.uid()));
create policy ph_admin_all     on public.ph_requests for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---- donation_requests ----
create policy donations_insert_public on public.donation_requests for insert to anon, authenticated
  with check (status = 'nueva' and amount_cop is null and admin_notes is null and handled_by is null
              and (user_id is null or user_id = (select auth.uid())));
create policy donations_select_own    on public.donation_requests for select to authenticated
  using (user_id = (select auth.uid()));
create policy donations_admin_all     on public.donation_requests for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---- contact_messages ----
create policy contact_insert_public on public.contact_messages for insert to anon, authenticated
  with check (status = 'nuevo' and admin_notes is null
              and (user_id is null or user_id = (select auth.uid())));
create policy contact_admin_all     on public.contact_messages for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---- CMS: site_settings / site_sections / site_section_items ----
create policy settings_select_public on public.site_settings for select to anon, authenticated
  using (true);
create policy settings_admin_all     on public.site_settings for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy sections_select_public on public.site_sections for select to anon, authenticated
  using (is_visible);
create policy sections_admin_all     on public.site_sections for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy items_select_public on public.site_section_items for select to anon, authenticated
  using (is_visible);
create policy items_admin_all     on public.site_section_items for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---- Aula virtual: módulos, materiales, actividades, anuncios ----
create policy modules_select_enrolled on public.course_modules for select to authenticated
  using (is_published and (select public.is_enrolled(course_id)));
create policy modules_admin_all       on public.course_modules for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy materials_select_enrolled on public.course_materials for select to authenticated
  using (is_published and (select public.is_enrolled(course_id)));
create policy materials_admin_all       on public.course_materials for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy assignments_select_enrolled on public.assignments for select to authenticated
  using (is_published and (select public.is_enrolled(course_id)));
create policy assignments_admin_all       on public.assignments for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy announcements_select_enrolled on public.course_announcements for select to authenticated
  using (is_published and (select public.is_enrolled(course_id)));
create policy announcements_admin_all       on public.course_announcements for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---- submissions ----
create policy submissions_select_own on public.submissions for select to authenticated
  using (user_id = (select auth.uid()));
create policy submissions_insert_own on public.submissions for insert to authenticated
  with check (user_id = (select auth.uid()) and (select public.can_access_assignment(assignment_id)));
create policy submissions_update_own on public.submissions for update to authenticated
  using (user_id = (select auth.uid()) and status in ('borrador', 'devuelta'))
  with check (user_id = (select auth.uid()));
create policy submissions_admin_all  on public.submissions for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---- submission_files ----
create policy sfiles_select_own on public.submission_files for select to authenticated
  using (exists (select 1 from public.submissions s
                 where s.id = submission_id and s.user_id = (select auth.uid())));
create policy sfiles_insert_own on public.submission_files for insert to authenticated
  with check ((select public.can_edit_submission(submission_id)));
create policy sfiles_delete_own on public.submission_files for delete to authenticated
  using ((select public.can_edit_submission(submission_id)));
create policy sfiles_admin_all  on public.submission_files for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---- material_progress ----
create policy progress_select_own on public.material_progress for select to authenticated
  using (user_id = (select auth.uid()));
create policy progress_insert_own on public.material_progress for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.course_materials m
                where m.id = material_id and m.is_published and public.is_enrolled(m.course_id))
  );
create policy progress_delete_own on public.material_progress for delete to authenticated
  using (user_id = (select auth.uid()));
create policy progress_admin_select on public.material_progress for select to authenticated
  using ((select public.is_admin()));

-- ---- notifications ----
create policy notifications_select_own on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy notifications_update_own on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy notifications_delete_own on public.notifications for delete to authenticated
  using (user_id = (select auth.uid()));
-- Sin política de insert: solo los triggers (SECURITY DEFINER) crean notificaciones.
-- El usuario solo puede cambiar read_at:
revoke update on public.notifications from authenticated;
grant  update (read_at) on public.notifications to authenticated;


-- =====================================================================
-- 9. VISTAS Y FUNCIONES PARA LAS PANTALLAS
-- =====================================================================
-- Catálogo público de cursos con categoría y cupos disponibles
create or replace view public.courses_public
with (security_invoker = true) as
select
  c.id, c.slug, c.title, c.short_description, c.description, c.image_url,
  c.modality, c.schedule_text, c.location, c.start_date, c.end_date,
  c.capacity, c.is_free, c.price_cop, c.min_age, c.max_age, c.requirements,
  c.certificate_info, c.sort_order,
  cat.name         as category_name,
  cat.slug         as category_slug,
  cat.accent_color as category_color,
  case when c.capacity is null then null
       else greatest(c.capacity - public.course_seats_taken(c.id), 0) end as seats_available
from public.courses c
left join public.course_categories cat on cat.id = c.category_id
where c.status = 'publicado';

-- Promedio por estudiante y curso, en escala 0 a 5 (respeta RLS: el estudiante ve lo suyo, el admin todo)
create or replace view public.course_grades
with (security_invoker = true) as
select
  a.course_id,
  s.user_id,
  count(*)                                           as submissions_count,
  count(*) filter (where s.status = 'calificada')    as graded_count,
  round(avg(s.score / nullif(a.max_score, 0) * 5) filter (where s.status = 'calificada'), 2) as average_score_5
from public.submissions s
join public.assignments a on a.id = s.assignment_id
group by a.course_id, s.user_id;

-- Bandeja de entregas (el admin filtra por status = 'entregada' para calificar)
create or replace view public.submissions_overview
with (security_invoker = true) as
select
  s.id as submission_id, s.status, s.submitted_at, s.is_late, s.score, a.max_score,
  a.id as assignment_id, a.title as assignment_title, a.due_at,
  c.id as course_id, c.title as course_title,
  s.user_id, p.full_name as student_name, p.email as student_email
from public.submissions s
join public.assignments a on a.id = s.assignment_id
join public.courses c     on c.id = a.course_id
join public.profiles p    on p.id = s.user_id;

-- Resumen del dashboard del administrador (solo ejecuta si es admin)
create or replace function public.admin_dashboard_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'inscripciones_mes',         (select count(*) from public.course_enrollments where created_at >= date_trunc('month', now())),
    'cursos_activos',            (select count(*) from public.courses where status = 'publicado'),
    'solicitudes_ph_pendientes', (select count(*) from public.ph_requests where status = 'pendiente'),
    'donaciones_nuevas',         (select count(*) from public.donation_requests where status = 'nueva'),
    'mensajes_nuevos',           (select count(*) from public.contact_messages where status = 'nuevo'),
    'entregas_por_calificar',    (select count(*) from public.submissions where status = 'entregada'),
    'inscripciones_por_mes',     (
      select coalesce(jsonb_agg(jsonb_build_object('mes', to_char(t.m, 'YYYY-MM'), 'total', t.c) order by t.m), '[]'::jsonb)
      from (
        select date_trunc('month', created_at) as m, count(*) as c
        from public.course_enrollments
        where created_at >= date_trunc('month', now()) - interval '5 months'
        group by 1
      ) t
    )
  );
end;
$$;

revoke execute on function public.admin_dashboard_summary() from public, anon;
grant  execute on function public.admin_dashboard_summary() to authenticated;


-- =====================================================================
-- 10. STORAGE (buckets y políticas)
-- =====================================================================
-- Convenciones de rutas:
--   public-assets/    imágenes del sitio y de cursos (público, solo admin sube)
--   avatars/          {user_id}/avatar.ext (público, cada usuario sube lo suyo)
--   course-materials/ {course_id}/archivo (privado: admin sube, inscritos leen)
--   submissions/      {user_id}/{assignment_id}/archivo (privado: dueño y admin)
-- Si el SQL Editor no deja crear políticas en storage.objects, créalas desde
-- el panel Storage > Policies con las mismas condiciones.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('public-assets', 'public-assets', true,  5242880,
    array['image/jpeg','image/png','image/webp','image/svg+xml','image/gif']),
  ('avatars', 'avatars', true, 2097152,
    array['image/jpeg','image/png','image/webp']),
  ('course-materials', 'course-materials', false, 52428800,
    array['application/pdf','image/jpeg','image/png','image/webp','video/mp4','text/plain',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
  ('submissions', 'submissions', false, 20971520,
    array['application/pdf','image/jpeg','image/png','image/webp','text/plain','application/zip',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict (id) do nothing;

-- public-assets: lectura pública por URL; escritura solo admin
create policy "public_assets_admin_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'public-assets' and (select public.is_admin()));
create policy "public_assets_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'public-assets' and (select public.is_admin()));
create policy "public_assets_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'public-assets' and (select public.is_admin()));

-- avatars: cada usuario gestiona su carpeta
create policy "avatars_own_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars_own_update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars_own_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- course-materials: el admin gestiona; los inscritos confirmados leen
create policy "materials_read" on storage.objects for select to authenticated
  using (
    bucket_id = 'course-materials'
    and (
      (select public.is_admin())
      or case
           when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
             then public.is_enrolled(((storage.foldername(name))[1])::uuid)
           else false
         end
    )
  );
create policy "materials_admin_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'course-materials' and (select public.is_admin()));
create policy "materials_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'course-materials' and (select public.is_admin()));
create policy "materials_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'course-materials' and (select public.is_admin()));

-- submissions: el estudiante sube y lee solo lo suyo; el admin lee todo
create policy "submissions_own_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'submissions' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "submissions_own_or_admin_read" on storage.objects for select to authenticated
  using (bucket_id = 'submissions'
         and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin())));
create policy "submissions_own_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'submissions' and (storage.foldername(name))[1] = (select auth.uid())::text);


-- =====================================================================
-- 11. DATOS INICIALES
-- =====================================================================
-- Categorías (de los folletos de la fundación)
insert into public.course_categories (slug, name, description, accent_color, sort_order) values
  ('arte-y-cultura',          'Arte y Cultura',          'Pintura, cerámica, manualidades y actividades culturales comunitarias.', '#2E7D32', 1),
  ('belleza-y-emprendimiento','Belleza y Emprendimiento','Formación técnica para generar ingresos.',                                '#AD1457', 2),
  ('educacion-y-oficios',     'Educación y Oficios',     'Música, formulación de proyectos, emprendimiento y oficios técnicos.',   '#1565C0', 3)
on conflict (slug) do nothing;

-- Cursos en BORRADOR (el admin completa horarios, cupos e imágenes y los publica)
insert into public.courses (category_id, slug, title, short_description, sort_order, status)
select c.id, v.slug, v.title, v.short_description, v.ord, 'borrador'
from (values
  ('arte-y-cultura',          'pintura-en-ceramica',        'Pintura en cerámica',                 'Técnicas de pintura sobre piezas de cerámica.', 1),
  ('arte-y-cultura',          'pintura-al-oleo',            'Pintura al óleo',                     'Introducción a la pintura al óleo.', 2),
  ('arte-y-cultura',          'decoupage-y-manualidades',   'Decoupage y manualidades',            'Transformación de objetos con decoupage y manualidades.', 3),
  ('belleza-y-emprendimiento','diseno-de-cejas',            'Diseño de cejas',                     'Técnicas de diseño de cejas.', 4),
  ('belleza-y-emprendimiento','lifting-de-pestanas',        'Lifting de pestañas',                 'Técnica de lifting de pestañas.', 5),
  ('belleza-y-emprendimiento','trenzas-con-kanekalon',      'Trenzas con Kanekalon',               'Peinados y trenzas con Kanekalon.', 6),
  ('educacion-y-oficios',     'iniciacion-musical',         'Iniciación musical (piano y violín)', 'Primeros pasos en piano y violín.', 7),
  ('educacion-y-oficios',     'formulacion-de-proyectos',   'Formulación de proyectos',            'Cómo formular proyectos sociales y productivos.', 8),
  ('educacion-y-oficios',     'creacion-de-emprendimientos','Creación de emprendimientos',         'Ideas de negocio y primeros pasos para emprender.', 9),
  ('educacion-y-oficios',     'electricidad-y-mecanica-automotriz','Electricidad y mecánica automotriz','Fundamentos de electricidad y mecánica automotriz.', 10)
) as v(cat_slug, slug, title, short_description, ord)
join public.course_categories c on c.slug = v.cat_slug
on conflict (slug) do nothing;

-- Configuración global
insert into public.site_settings (key, value, description) values
  ('contact', jsonb_build_object(
      'phone',     '300 909 6862',
      'whatsapp',  '573009096862',
      'email',     'f.principioyfin@gmail.com',
      'address',   'Cra. 73 H Bis # 76 – 65 Sur, Bogotá D.C.'),
   'Datos de contacto mostrados en el sitio'),
  ('social', jsonb_build_object(
      'facebook_label',  'Fundación Principio y Fin',
      'facebook_url',    '',
      'instagram_label', '@f.principioyfin',
      'instagram_url',   ''),
   'Redes sociales (completar las URLs)'),
  ('footer', jsonb_build_object(
      'description', 'Fundación Principio & Fin: transformamos comunidades a través del arte, la educación, la cultura y el emprendimiento.',
      'closing_line', 'AMOR • FE • ESPERANZA',
      'copyright',   '© 2026 Fundación Principio & Fin. Todos los derechos reservados.'),
   'Textos del pie de página')
on conflict (key) do nothing;

-- Secciones del Home
insert into public.site_sections (page, section_key, title, subtitle, body, primary_cta_label, primary_cta_url, secondary_cta_label, secondary_cta_url, is_visible, sort_order) values
  ('home', 'hero', 'Podemos sanar y volver a comenzar',
     'Conectamos talentos, transformamos futuros a través del arte, la educación, la cultura y el emprendimiento.',
     null, 'Ver programas', '/programas', 'Quiero donar', '/donaciones-y-alianzas', true, 1),
  ('home', 'stats', 'Nuestro impacto', null, null, null, null, null, null, false, 2),   -- ocultar hasta tener cifras reales
  ('home', 'programs', 'Programas y servicios', 'Formación que transforma comunidades', null, 'Ver programas', '/programas', null, null, true, 3),
  ('home', 'benefits', 'Beneficios', null, null, null, null, null, null, true, 4),
  ('home', 'values', 'Nuestros valores', null, null, null, null, null, null, true, 5),
  ('home', 'ph_banner', '¿Administras un conjunto residencial?',
     null, 'Activa el salón comunal con programas gratuitos y de bajo costo para tus residentes.',
     'Conocer la propuesta', '/propiedad-horizontal', null, null, true, 6),
  ('home', 'donation_cta', 'Cada aporte representa una oportunidad de transformación',
     null, 'Cada aporte representa una oportunidad de transformación para una familia y una comunidad.',
     'Donar ahora', '/donaciones-y-alianzas', 'Ser aliado', '/donaciones-y-alianzas', true, 7),
  ('home', 'allies', 'Articulamos esfuerzos', null, null, null, null, null, null, false, 8),
  ('quienes-somos', 'intro', 'Quiénes somos', null,
     'Somos una organización social comprometida con la transformación de comunidades a través del arte, la educación, la cultura y el emprendimiento. Creamos oportunidades para que niños, jóvenes, adultos y adultos mayores desarrollen su talento, fortalezcan sus habilidades y construyan un mejor futuro.',
     null, null, null, null, true, 1),
  ('quienes-somos', 'mision', 'Misión', null,
     'Promover el desarrollo integral de las personas mediante procesos educativos, culturales, artísticos y de emprendimiento que fortalezcan las capacidades individuales y colectivas, contribuyendo a la construcción de comunidades más unidas, productivas y solidarias.',
     null, null, null, null, true, 2),
  ('quienes-somos', 'vision', 'Visión', null,
     'Ser una fundación reconocida por generar oportunidades de transformación social a través de la educación, la cultura y el emprendimiento, impactando positivamente comunidades en todo el territorio nacional.',
     null, null, null, null, true, 3)
on conflict (page, section_key) do nothing;

-- Estadísticas (ocultas: reemplazar los valores por cifras reales y mostrar la sección)
insert into public.site_section_items (section_id, title, value, sort_order)
select s.id, v.title, v.value, v.ord
from public.site_sections s,
     (values ('Personas formadas', '0', 1), ('Talleres activos', '0', 2), ('Aliados', '0', 3), ('Localidades de Bogotá', '3', 4)) as v(title, value, ord)
where s.page = 'home' and s.section_key = 'stats';

-- Programas
insert into public.site_section_items (section_id, title, description, icon, link_label, link_url, sort_order)
select s.id, v.title, v.description, v.icon, 'Ver cursos', '/programas', v.ord
from public.site_sections s,
     (values
        ('Arte y Cultura', 'Pintura en cerámica, pintura al óleo, decoupage y manualidades, actividades culturales comunitarias.', 'palette', 1),
        ('Belleza y Emprendimiento', 'Diseño de cejas, lifting de pestañas, trenzas con Kanekalon y formación para generación de ingresos.', 'sparkles', 2),
        ('Educación y Oficios', 'Iniciación musical, formulación de proyectos, creación de emprendimientos, electricidad y mecánica automotriz.', 'graduation-cap', 3)
     ) as v(title, description, icon, ord)
where s.page = 'home' and s.section_key = 'programs';

-- Beneficios
insert into public.site_section_items (section_id, title, icon, sort_order)
select s.id, v.title, v.icon, v.ord
from public.site_sections s,
     (values
        ('Desarrollo de habilidades', 'sprout', 1),
        ('Formación certificada', 'badge-check', 2),
        ('Integración comunitaria', 'users', 3),
        ('Fortalecimiento del emprendimiento local', 'rocket', 4),
        ('Oportunidades para todas las edades', 'heart-handshake', 5)
     ) as v(title, icon, ord)
where s.page = 'home' and s.section_key = 'benefits';

-- Valores
insert into public.site_section_items (section_id, title, icon, sort_order)
select s.id, v.title, v.icon, v.ord
from public.site_sections s,
     (values
        ('Amor', 'heart', 1), ('Fe', 'cross', 2), ('Esperanza', 'sparkle', 3), ('Solidaridad', 'globe', 4),
        ('Inclusión', 'users', 5), ('Servicio', 'hand-heart', 6), ('Compromiso social', 'shield', 7)
     ) as v(title, icon, ord)
where s.page = 'home' and s.section_key = 'values';

-- =====================================================================
-- FIN DEL SCRIPT
-- =====================================================================
