-- =====================================================================
-- MIGRACIÓN OPCIONAL: SEED DE SOLICITUDES PH, DONACIONES Y POLÍTICA RLS PQRS
-- =====================================================================
-- Fundación Principio & Fin
-- Ejecutar en Supabase > SQL Editor si deseas poblar los datos de prueba
-- que coinciden exactamente con los diseños adjuntos.
-- =====================================================================

-- 1. Permitir que los usuarios autenticados puedan consultar sus propios mensajes / PQRS
DROP POLICY IF EXISTS contact_select_own ON public.contact_messages;
CREATE POLICY contact_select_own ON public.contact_messages
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR LOWER(email) = LOWER((SELECT auth.jwt() ->> 'email'))
  );

-- 2. Asegurar que las solicitudes PH y donaciones sin user_id se asocien al perfil por correo
UPDATE public.ph_requests ph
SET user_id = p.id
FROM public.profiles p
WHERE ph.user_id IS NULL AND LOWER(ph.email) = LOWER(p.email);

UPDATE public.donation_requests d
SET user_id = p.id
FROM public.profiles p
WHERE d.user_id IS NULL AND LOWER(d.email) = LOWER(p.email);

-- 3. Semilla de demostración para solicitudes PH vinculadas al usuario activo (ej. Camila Morales / Jan)
DO $$
DECLARE
  v_user_id uuid;
  v_user_email text;
BEGIN
  -- Tomar el primer usuario registrado en profiles (o el usuario de prueba)
  SELECT id, email INTO v_user_id, v_user_email 
  FROM public.profiles 
  ORDER BY created_at ASC 
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Insertar Conjunto Residencial Los Sauces - Etapa 2 si no existe
    IF NOT EXISTS (SELECT 1 FROM public.ph_requests WHERE complex_name = 'Conjunto Residencial Los Sauces - Etapa 2') THEN
      INSERT INTO public.ph_requests (
        user_id,
        administrator_name,
        role_title,
        complex_name,
        address,
        locality,
        phone,
        email,
        residents_count,
        message,
        accepted_data_policy,
        status,
        admin_notes,
        created_at
      ) VALUES (
        v_user_id,
        'Camila Morales',
        'Miembro del consejo',
        'Conjunto Residencial Los Sauces - Etapa 2',
        'Calle 45 Sur # 78-12',
        'Kennedy, Bogotá',
        '+57 312 458 9210',
        v_user_email,
        45,
        'Taller Solicitado: Pintura en Cerámica y Manualidades para Adultos Mayores. Diseñado para la integración y estimulación cognitiva de los copropietarios de la tercera edad en jornada vespertina.',
        true,
        'en_revision',
        'Coordinador Asignado: Lic. Álvaro Mendoza | VISITA: 18 MAR',
        now() - interval '3 days'
      );
    END IF;

    -- Insertar Conjunto Torres del Parque - Agrupación 3 si no existe
    IF NOT EXISTS (SELECT 1 FROM public.ph_requests WHERE complex_name = 'Conjunto Torres del Parque - Agrupación 3') THEN
      INSERT INTO public.ph_requests (
        user_id,
        administrator_name,
        role_title,
        complex_name,
        address,
        locality,
        phone,
        email,
        residents_count,
        message,
        accepted_data_policy,
        status,
        admin_notes,
        created_at
      ) VALUES (
        v_user_id,
        'Camila Morales',
        'Administrador',
        'Conjunto Torres del Parque - Agrupación 3',
        'Carrera 5 # 26-14',
        'Teusaquillo, Bogotá',
        '+57 312 458 9210',
        v_user_email,
        38,
        'Programa Activo: Huerta Urbana y Reciclaje Creativo Comunitario. Sesiones presenciales los sábados de 08:30 a 11:30 en las terrazas comunitarias y el salón social principal.',
        true,
        'aprobada',
        'Convenio vigente 2026. Docente: Ing. Sonia Rivas.',
        now() - interval '60 days'
      );
    END IF;

    -- Insertar aporte de ejemplo para Donaciones
    IF NOT EXISTS (SELECT 1 FROM public.donation_requests WHERE user_id = v_user_id) THEN
      INSERT INTO public.donation_requests (
        user_id,
        donor_name,
        donation_type,
        phone,
        email,
        message,
        accepted_data_policy,
        status,
        amount_cop,
        created_at
      ) VALUES (
        v_user_id,
        'Camila Morales',
        'economico',
        '+57 312 458 9210',
        v_user_email,
        '[Causa: Fondo Materiales y Arcilla] Aporte para dotación de pastas cerámicas de modelado para cursos de adultos mayores.',
        true,
        'concretada',
        500000,
        now() - interval '15 days'
      );
    END IF;

  END IF;
END $$;
