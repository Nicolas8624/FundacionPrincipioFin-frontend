-- =====================================================================
-- FUNDACIÓN PRINCIPIO & FIN — DATOS DE PRUEBA PARA EL USUARIO JUAN
-- =====================================================================
-- Archivo: 03_datos_prueba_juan.sql
-- Usuario: Juan
-- ID Supabase: 47bbf374-a969-4dce-baa4-e28444c544f2
--
-- Descripción:
--   Configura y puebla datos 100% reales para el usuario de pruebas 'Juan':
--   1. Asegura su perfil en 'profiles'.
--   2. Registra sus 2 Solicitudes PH (en revisión y aprobada).
--   3. Registra su donación económica comunitaria.
--   4. Registra sus 2 tickets de PQRS (1 respondido con nota oficial, 1 nuevo).
--   5. Matricula a Juan en 2 cursos con módulos reales y actividades:
--      - Cerámica: Con actividades en varios estados (Calificada 4.8, Calificada 4.5, Entregada en revisión, y Borrador guardado 3.3).
--      - Pintura al Óleo: Con actividad pendiente para probar entrega desde cero.
--
-- Ejecución:
--   Ejecutar en Supabase > SQL Editor después de '01' y '02'.
-- =====================================================================

DO $$
DECLARE
  v_juan_id uuid := '47bbf374-a969-4dce-baa4-e28444c544f2'::uuid;
  v_juan_email text;
  
  -- Variables Curso Cerámica
  v_course_ceramica_id uuid;
  v_mod1_id uuid;
  v_mod2_id uuid;
  v_mod3_id uuid;
  v_act1_1_id uuid;
  v_act2_1_id uuid;
  v_act3_1_id uuid;
  v_act3_3_id uuid;
  v_enroll_ceramica_id uuid;

  -- Variables Curso Óleo
  v_course_oleo_id uuid;
  v_mod_oleo_id uuid;
  v_act_oleo_1_id uuid;
  v_enroll_oleo_id uuid;

BEGIN
  -- -------------------------------------------------------------------
  -- 1. IDENTIFICAR O ASIGNAR CORREO DE JUAN
  -- -------------------------------------------------------------------
  SELECT email INTO v_juan_email FROM public.profiles WHERE id = v_juan_id;
  IF v_juan_email IS NULL THEN
    SELECT email INTO v_juan_email FROM auth.users WHERE id = v_juan_id;
  END IF;

  IF v_juan_email IS NULL THEN
    v_juan_email := 'juan@comunidad.edu.co';
  END IF;

  -- Asegurar registro de perfil de Juan
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    phone, 
    locality, 
    document_type,
    document_number,
    is_active
  )
  VALUES (
    v_juan_id, 
    v_juan_email, 
    'Juan', 
    'user', 
    '+57 312 458 9210', 
    'Kennedy, Bogotá', 
    'CC',
    '1020304050',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = 'Juan',
      phone = COALESCE(public.profiles.phone, '+57 312 458 9210'),
      locality = COALESCE(public.profiles.locality, 'Kennedy, Bogotá'),
      document_type = COALESCE(public.profiles.document_type, 'CC'),
      document_number = COALESCE(public.profiles.document_number, '1020304050');

  -- -------------------------------------------------------------------
  -- 2. SOLICITUDES DE PROPIEDAD HORIZONTAL (PH)
  -- -------------------------------------------------------------------
  -- Solicitud 1: En Revisión Técnica y Visita (Paso 2)
  DELETE FROM public.ph_requests WHERE complex_name = 'Conjunto Residencial Los Sauces - Etapa 2' AND user_id = v_juan_id;
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
    v_juan_id,
    'Juan',
    'Miembro del consejo',
    'Conjunto Residencial Los Sauces - Etapa 2',
    'Calle 45 Sur # 78-12',
    'Kennedy, Bogotá',
    '+57 312 458 9210',
    v_juan_email,
    45,
    'Taller Solicitado: Pintura en Cerámica y Manualidades para Adultos Mayores. Diseñado para la integración y estimulación cognitiva de los copropietarios de la tercera edad en jornada vespertina.',
    true,
    'en_revision',
    'Coordinador Asignado: Lic. Álvaro Mendoza | VISITA: 18 MAR',
    now() - interval '3 days'
  );

  -- Solicitud 2: Convenio Aprobado y en Ejecución (Paso 4)
  DELETE FROM public.ph_requests WHERE complex_name = 'Conjunto Torres del Parque - Agrupación 3' AND user_id = v_juan_id;
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
    v_juan_id,
    'Juan',
    'Administrador',
    'Conjunto Torres del Parque - Agrupación 3',
    'Carrera 5 # 26-14',
    'Teusaquillo, Bogotá',
    '+57 312 458 9210',
    v_juan_email,
    38,
    'Programa Activo: Huerta Urbana y Reciclaje Creativo Comunitario. Sesiones presenciales los sábados de 08:30 a 11:30 en las terrazas comunitarias y el salón social principal.',
    true,
    'aprobada',
    'Convenio vigente 2026. Docente: Ing. Sonia Rivas.',
    now() - interval '60 days'
  );

  -- -------------------------------------------------------------------
  -- 3. DONACIONES Y APORTES COMUNITARIOS
  -- -------------------------------------------------------------------
  DELETE FROM public.donation_requests WHERE user_id = v_juan_id;
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
    v_juan_id,
    'Juan',
    'economico',
    '+57 312 458 9210',
    v_juan_email,
    '[Causa: Fondo Materiales y Arcilla] Aporte para dotación de pastas cerámicas de modelado para cursos de adultos mayores.',
    true,
    'concretada',
    500000,
    now() - interval '15 days'
  );

  -- -------------------------------------------------------------------
  -- 4. MENSAJES DE CONTACTO / PQRS
  -- -------------------------------------------------------------------
  DELETE FROM public.contact_messages WHERE user_id = v_juan_id;
  
  -- PQRS 1: Respondida por el equipo de coordinación
  INSERT INTO public.contact_messages (
    user_id,
    name,
    email,
    phone,
    subject,
    message,
    accepted_data_policy,
    status,
    admin_notes,
    created_at
  ) VALUES (
    v_juan_id,
    'Juan',
    v_juan_email,
    '+57 312 458 9210',
    'Otro',
    '[PQRS: CERTIFICADOS DE APROBACIÓN] [Asunto: Inconsistencia al descargar certificado] Culminé satisfactoriamente el taller de cerámica pero me aparece pendiente la nota final.',
    true,
    'respondido',
    'Hola Juan, validamos con la docente Mtra. Lucía Forero y tu calificación de 4.8 ya quedó registrada. Ya puedes descargar tu diploma con código QR desde Mis Cursos.',
    now() - interval '2 days'
  );

  -- PQRS 2: Nueva en gestión
  INSERT INTO public.contact_messages (
    user_id,
    name,
    email,
    phone,
    subject,
    message,
    accepted_data_policy,
    status,
    admin_notes,
    created_at
  ) VALUES (
    v_juan_id,
    'Juan',
    v_juan_email,
    '+57 312 458 9210',
    'Inscripción a cursos',
    '[PQRS: INSCRIPCIONES Y CUPOS] [Asunto: Apertura de grupo sábados] Quisiera consultar si se abrirán cupos en jornada sabatina para el taller de Pintura al Óleo.',
    true,
    'nuevo',
    null,
    now() - interval '4 hours'
  );

  -- -------------------------------------------------------------------
  -- 5. CURSO 1: CERÁMICA ARTÍSTICA Y MODELADO EN TORNO
  -- -------------------------------------------------------------------
  SELECT id INTO v_course_ceramica_id 
  FROM public.courses 
  WHERE slug = 'ceramica-artistica-modelado-torno' OR title ILIKE '%cerámica%' 
  LIMIT 1;

  IF v_course_ceramica_id IS NULL THEN
    INSERT INTO public.courses (
      title,
      slug,
      short_description,
      description,
      modality,
      status,
      instructor_name,
      cohort,
      total_sessions,
      schedule_text,
      location,
      image_url
    ) VALUES (
      'Cerámica Artística y Modelado en Torno',
      'ceramica-artistica-modelado-torno',
      'Taller vivencial de modelado cerámico, torno tradicional y quemas comunitarias.',
      'Preparación de pastas cerámicas, centrado en torno alfarero, confección de piezas utilitarias, texturizado manual, horneado y formulación de esmaltes libres de plomo.',
      'hibrido',
      'publicado',
      'Mtra. Lucía Forero',
      '2026-I',
      16,
      'Sábados • 9:00 AM - 12:00 PM',
      'Sede Central Bogotá • Salón Torno',
      '/images/taller-ceramica.jpg'
    ) RETURNING id INTO v_course_ceramica_id;
  END IF;

  IF v_course_ceramica_id IS NOT NULL THEN
    -- Módulo 1
    SELECT id INTO v_mod1_id FROM public.course_modules WHERE course_id = v_course_ceramica_id AND sort_order = 1 LIMIT 1;
    IF v_mod1_id IS NULL THEN
      INSERT INTO public.course_modules (course_id, title, description, sort_order)
      VALUES (v_course_ceramica_id, 'Módulo 1: Fundamentos de la Arcilla y Preparación de Pastas', 'Identificación de barros locales, amasado en espiral y eliminación de bolsas de aire.', 1)
      RETURNING id INTO v_mod1_id;
    END IF;

    -- Módulo 2
    SELECT id INTO v_mod2_id FROM public.course_modules WHERE course_id = v_course_ceramica_id AND sort_order = 2 LIMIT 1;
    IF v_mod2_id IS NULL THEN
      INSERT INTO public.course_modules (course_id, title, description, sort_order)
      VALUES (v_course_ceramica_id, 'Módulo 2: Modelado en Torno y Técnicas Manuales', 'Técnica de pellizco, colombines y centrado rotativo en torno alfarero.', 2)
      RETURNING id INTO v_mod2_id;
    END IF;

    -- Módulo 3
    SELECT id INTO v_mod3_id FROM public.course_modules WHERE course_id = v_course_ceramica_id AND sort_order = 3 LIMIT 1;
    IF v_mod3_id IS NULL THEN
      INSERT INTO public.course_modules (course_id, title, description, sort_order)
      VALUES (v_course_ceramica_id, 'Módulo 3: Quema y Técnicas Ancestrales de Acabado', 'Atmósferas de reducción, bruñido con cuarzo de río y vidriados artesanales.', 3)
      RETURNING id INTO v_mod3_id;
    END IF;

    -- Materiales didácticos del curso
    IF NOT EXISTS (SELECT 1 FROM public.course_materials WHERE course_id = v_course_ceramica_id AND title ILIKE '%Guía Técnica%') THEN
      INSERT INTO public.course_materials (course_id, module_id, title, description, url, storage_path, type, sort_order)
      VALUES (v_course_ceramica_id, v_mod1_id, 'Guía Técnica: Preparación de Pastas Cerámicas', 'Manual descargable con proporciones de chamota y arcilla roja.', '/docs/guia-pastas-ceramicas.pdf', 'materials/guia-pastas-ceramicas.pdf', 'pdf', 1);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.course_materials WHERE course_id = v_course_ceramica_id AND title ILIKE '%Protocolo de Seguridad%') THEN
      INSERT INTO public.course_materials (course_id, module_id, title, description, url, storage_path, type, sort_order)
      VALUES (v_course_ceramica_id, v_mod3_id, 'Protocolo de Seguridad para Quema en Horno de Pozo', 'Curvas de temperatura y precauciones para cocción cerámica.', '/docs/protocolo-quema-ancestral.pdf', 'materials/protocolo-quema-ancestral.pdf', 'pdf', 2);
    END IF;

    -- Actividad 1.1 (Calificada: 4.8)
    SELECT id INTO v_act1_1_id FROM public.assignments WHERE course_id = v_course_ceramica_id AND title ILIKE '%Muestrario de Pastas%' LIMIT 1;
    IF v_act1_1_id IS NULL THEN
      INSERT INTO public.assignments (
        course_id, module_id, title, instructions, due_at, weight_percent, max_score, is_published
      ) VALUES (
        v_course_ceramica_id, v_mod1_id,
        'Actividad 1.1: Muestrario de Pastas y Texturas Cerámicas',
        'Elaborar 4 placas de prueba de 10x10 cm con diferentes niveles de chamota y textura manual.',
        now() - interval '25 days', 20, 5.00, true
      ) RETURNING id INTO v_act1_1_id;
    END IF;

    -- Actividad 2.1 (Calificada: 4.5)
    SELECT id INTO v_act2_1_id FROM public.assignments WHERE course_id = v_course_ceramica_id AND title ILIKE '%Confección de Vasija%' LIMIT 1;
    IF v_act2_1_id IS NULL THEN
      INSERT INTO public.assignments (
        course_id, module_id, title, instructions, due_at, weight_percent, max_score, is_published
      ) VALUES (
        v_course_ceramica_id, v_mod2_id,
        'Actividad 2.1: Confección de Vasija Utilitaria en Torno',
        'Centrado en torno y elevación cilíndrica de una vasija de mínimo 15 cm de altura.',
        now() - interval '10 days', 30, 5.00, true
      ) RETURNING id INTO v_act2_1_id;
    END IF;

    -- Actividad 3.1 (Entregada - En revisión docente)
    SELECT id INTO v_act3_1_id FROM public.assignments WHERE course_id = v_course_ceramica_id AND title ILIKE '%Bitácora de Horno%' LIMIT 1;
    IF v_act3_1_id IS NULL THEN
      INSERT INTO public.assignments (
        course_id, module_id, title, instructions, due_at, weight_percent, max_score, is_published
      ) VALUES (
        v_course_ceramica_id, v_mod3_id,
        'Actividad 3.1: Registro de Curvas Térmicas y Bitácora de Horno',
        'Monitoreo técnico de temperaturas durante la precocción de bizcocho (600°C a 900°C).',
        now() + interval '5 days', 25, 5.00, true
      ) RETURNING id INTO v_act3_1_id;
    END IF;

    -- Actividad 3.3 (Proyecto Final - Borrador guardado)
    SELECT id INTO v_act3_3_id FROM public.assignments WHERE course_id = v_course_ceramica_id AND title ILIKE '%Actividad 3.3%' LIMIT 1;
    IF v_act3_3_id IS NULL THEN
      INSERT INTO public.assignments (
        course_id,
        module_id,
        title,
        instructions,
        due_at,
        weight_percent,
        max_score,
        rubric_criteria,
        is_published
      ) VALUES (
        v_course_ceramica_id,
        v_mod3_id,
        'Actividad 3.3: Entrega Proyecto 3: Quema y Técnicas Ancestrales de Acabado',
        'En esta actividad culminante pondrás en práctica los principios de equilibrio térmico, alquimia de barros y rescate de iconografía tradicional transmitidos durante las clases prácticas.',
        now() + interval '7 days',
        25,
        5.00,
        '[
          {
            "number": "01",
            "title": "Técnica de Modelado y Simetría",
            "weight": 35,
            "desc": "Precisión en espesores de pared (4mm - 6mm), balance estructural y resistencia al secado sin fisuras."
          },
          {
            "number": "02",
            "title": "Acabado y Uniformidad de Esmalte",
            "weight": 35,
            "desc": "Calidad del bruñido, adherencia del vidriado por inmersión y control de vitrificación en el proceso térmico."
          },
          {
            "number": "03",
            "title": "Creatividad & Narrativa Comunitaria",
            "weight": 30,
            "desc": "Coherencia estética, simbolismo de la pieza y profundidad en la bitácora cultural entregada."
          }
        ]'::jsonb,
        true
      ) RETURNING id INTO v_act3_3_id;
    END IF;

    -- Matrícula de Juan en Cerámica
    SELECT id INTO v_enroll_ceramica_id FROM public.course_enrollments WHERE user_id = v_juan_id AND course_id = v_course_ceramica_id LIMIT 1;
    IF v_enroll_ceramica_id IS NULL THEN
      INSERT INTO public.course_enrollments (
        course_id, user_id, full_name, email, phone, status, attended_sessions, average_grade, accepted_data_policy
      ) VALUES (
        v_course_ceramica_id, v_juan_id, 'Juan', v_juan_email, '+57 312 458 9210', 'confirmada', 6, 4.7, true
      ) RETURNING id INTO v_enroll_ceramica_id;
    ELSE
      UPDATE public.course_enrollments
      SET attended_sessions = 6, average_grade = 4.7, status = 'confirmada', accepted_data_policy = true
      WHERE id = v_enroll_ceramica_id;
    END IF;

    -- Entregas de Juan en Cerámica
    -- Entrega 1.1 (Calificada: 4.8)
    DELETE FROM public.submissions WHERE assignment_id = v_act1_1_id AND user_id = v_juan_id;
    INSERT INTO public.submissions (
      assignment_id, user_id, enrollment_id, project_title, status, submitted_at, score, feedback, text_content
    ) VALUES (
      v_act1_1_id, v_juan_id, v_enroll_ceramica_id,
      'Muestrario de Pastas con Chamota Fina',
      'calificada', now() - interval '24 days', 4.8,
      'Excelente homogeneidad en el amasado y correcto rotulado de las 4 probetas.',
      'Se utilizó arcilla roja de Chocontá mezclada con chamota al 15% y 25%.'
    );

    -- Entrega 2.1 (Calificada: 4.5)
    DELETE FROM public.submissions WHERE assignment_id = v_act2_1_id AND user_id = v_juan_id;
    INSERT INTO public.submissions (
      assignment_id, user_id, enrollment_id, project_title, status, submitted_at, score, feedback, text_content
    ) VALUES (
      v_act2_1_id, v_juan_id, v_enroll_ceramica_id,
      'Vasija Cilíndrica Utilitaria',
      'calificada', now() - interval '9 days', 4.5,
      'Buen centrado y acabado de boca. Recomendado aligerar el peso en el tercio inferior de la base.',
      'Pieza torneada con 1.2 kg de pasta blanca, bruñida en estado de cuero con ágata.'
    );

    -- Entrega 3.1 (Entregada - Pendiente revisión)
    DELETE FROM public.submissions WHERE assignment_id = v_act3_1_id AND user_id = v_juan_id;
    INSERT INTO public.submissions (
      assignment_id, user_id, enrollment_id, project_title, status, submitted_at, text_content
    ) VALUES (
      v_act3_1_id, v_juan_id, v_enroll_ceramica_id,
      'Bitácora de Monitoreo de Horno Comunitario',
      'entregada', now() - interval '1 day',
      'Registro fotográfico de conos pirométricos Orton 06 y curva de subida térmica a 150°C por hora.'
    );

    -- Entrega 3.3 (Borrador guardado)
    DELETE FROM public.submissions WHERE assignment_id = v_act3_3_id AND user_id = v_juan_id;
    INSERT INTO public.submissions (
      assignment_id, user_id, enrollment_id, project_title, status, text_content, created_at
    ) VALUES (
      v_act3_3_id, v_juan_id, v_enroll_ceramica_id,
      'Vasija Ceremonial Bruñida con Óxidos Locales',
      'borrador',
      'Curva de temperatura mantenida a 920°C en atmósfera reductora con leña de eucalipto.',
      now() - interval '2 hours'
    );

  END IF;

  -- -------------------------------------------------------------------
  -- 6. CURSO 2: PINTURA AL ÓLEO (Para probar entrega nueva desde cero)
  -- -------------------------------------------------------------------
  SELECT id INTO v_course_oleo_id 
  FROM public.courses 
  WHERE slug = 'pintura-al-oleo-tecnicas-clasicas' OR title ILIKE '%óleo%' 
  LIMIT 1;

  IF v_course_oleo_id IS NULL THEN
    INSERT INTO public.courses (
      title,
      slug,
      short_description,
      description,
      modality,
      status,
      instructor_name,
      cohort,
      total_sessions,
      schedule_text,
      location,
      image_url
    ) VALUES (
      'Pintura al Óleo: Técnicas Clásicas y Mixtas',
      'pintura-al-oleo-tecnicas-clasicas',
      'Desarrollo de composición figurativa, preparación de soportes con imprimación tradicional y veladuras.',
      'Curso intensivo enfocado en los fundamentos del dibujo de academia y la técnica del óleo por capas.',
      'presencial',
      'publicado',
      'Mtro. Fernando Arciniegas',
      '2026-I',
      16,
      'Martes y Jueves • 2:00 PM - 5:00 PM',
      'Sede Central Bogotá (Taller San Rafael)',
      '/images/taller-oleo.jpg'
    ) RETURNING id INTO v_course_oleo_id;
  END IF;

  IF v_course_oleo_id IS NOT NULL THEN
    -- Módulo 1 de Óleo
    SELECT id INTO v_mod_oleo_id FROM public.course_modules WHERE course_id = v_course_oleo_id AND sort_order = 1 LIMIT 1;
    IF v_mod_oleo_id IS NULL THEN
      INSERT INTO public.course_modules (course_id, title, description, sort_order)
      VALUES (v_course_oleo_id, 'Módulo 1: Imprimación y Preparación de Bastidores', 'Tensado de tela de lino y aplicación de gesso artesanal con cola de conejo.', 1)
      RETURNING id INTO v_mod_oleo_id;
    END IF;

    -- Actividad 1.1 de Óleo (Sin entrega aún -> Pendiente)
    SELECT id INTO v_act_oleo_1_id FROM public.assignments WHERE course_id = v_course_oleo_id AND title ILIKE '%Preparación de Bastidor%' LIMIT 1;
    IF v_act_oleo_1_id IS NULL THEN
      INSERT INTO public.assignments (
        course_id, module_id, title, instructions, due_at, weight_percent, max_score, is_published
      ) VALUES (
        v_course_oleo_id, v_mod_oleo_id,
        'Actividad 1.1: Preparación de Bastidor y Carta de Color Primaria',
        'Armar un bastidor de 40x50 cm, aplicar 3 capas de gesso con lijado intermedio y presentar una carta de mezclas con colores primarios.',
        now() + interval '12 days', 30, 5.00, true
      ) RETURNING id INTO v_act_oleo_1_id;
    END IF;

    -- Matrícula de Juan en Óleo
    SELECT id INTO v_enroll_oleo_id FROM public.course_enrollments WHERE user_id = v_juan_id AND course_id = v_course_oleo_id LIMIT 1;
    IF v_enroll_oleo_id IS NULL THEN
      INSERT INTO public.course_enrollments (
        course_id, user_id, full_name, email, phone, status, attended_sessions, accepted_data_policy
      ) VALUES (
        v_course_oleo_id, v_juan_id, 'Juan', v_juan_email, '+57 312 458 9210', 'confirmada', 2, true
      ) RETURNING id INTO v_enroll_oleo_id;
    ELSE
      UPDATE public.course_enrollments
      SET attended_sessions = 2, status = 'confirmada', accepted_data_policy = true
      WHERE id = v_enroll_oleo_id;
    END IF;

  END IF;

END $$;

-- ---------------------------------------------------------------------
-- Mensaje de verificación final
-- ---------------------------------------------------------------------
SELECT 
  'Datos de prueba para Juan configurados exitosamente (ID: 47bbf374-a969-4dce-baa4-e28444c544f2)' AS resultado;
