-- =====================================================================
-- FUNDACIÓN PRINCIPIO & FIN — DATOS SEMILLA DE CURSOS Y CATÁLOGO
-- =====================================================================
-- Archivo: 02_datos_semilla_cursos.sql
-- Descripción:
--   Inserta las categorías oficiales y los 10 talleres formativos
--   abiertos para la convocatoria comunitaria 2026.
--   Incluye imágenes reales de alta calidad, docentes formadores,
--   modalidades, horarios, sedes y número de sesiones.
--
-- Ejecución:
--   Ejecutar en Supabase > SQL Editor después de '01_esquema_completo.sql'.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. CATEGORÍAS OFICIALES DE FORMACIÓN
-- ---------------------------------------------------------------------
INSERT INTO public.course_categories (id, slug, name, description, icon_name, accent_color, sort_order)
VALUES
  (
    '0612d049-a097-4856-bd57-dd9f4db0afee',
    'artes-y-oficios',
    'Artes y Oficios Tradicionales',
    'Programas de recuperación de saberes manuales, artes plásticas, modelado y oficios patrimoniales.',
    'Palette',
    '#D4AF37',
    1
  ),
  (
    'cb664d6b-1031-4365-892a-b7f3ca188e48',
    'belleza-y-estetica',
    'Belleza, Estética y Bienestar',
    'Talleres técnicos orientados al cuidado personal, cosmetología básica y autoempleo productivo.',
    'Sparkles',
    '#E0B0FF',
    2
  ),
  (
    '8f15ccf2-8c60-4b51-bd6c-11df44ac4de6',
    'textiles-y-confeccion',
    'Diseño Textil y Emprendimiento',
    'Confección textil, patronaje, marroquinería y modelos asociativos de negocio familiar.',
    'Scissors',
    '#4ADE80',
    3
  )
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon_name = EXCLUDED.icon_name,
    accent_color = EXCLUDED.accent_color,
    sort_order = EXCLUDED.sort_order;

-- ---------------------------------------------------------------------
-- 2. LOS 10 CURSOS OFICIALES (OFERTA FORMATIVA 2026)
-- ---------------------------------------------------------------------
INSERT INTO public.courses (
  category_id,
  title,
  slug,
  short_description,
  description,
  modality,
  status,
  capacity,
  schedule_text,
  location,
  instructor_name,
  cohort,
  total_sessions,
  image_url
)
VALUES 
  (
    '0612d049-a097-4856-bd57-dd9f4db0afee',
    'Pintura al Óleo: Técnicas Clásicas y Mixtas',
    'pintura-al-oleo-tecnicas-clasicas',
    'Desarrollo de composición figurativa, preparación de soportes con imprimación tradicional, teoría del color, veladuras y técnicas mixtas al óleo con pigmentos profesionales.',
    'Curso intensivo enfocado en los fundamentos del dibujo de academia y la técnica del óleo por capas. Los participantes aprenden desde el montaje y tensado del lienzo hasta veladuras transparentes y empastes matéricos.',
    'presencial',
    'publicado',
    15,
    'Martes y Jueves • 2:00 PM - 5:00 PM',
    'Sede Central Bogotá (Taller San Rafael)',
    'Mtro. Fernando Arciniegas',
    '2026-I',
    16,
    '/images/taller-oleo.jpg'
  ),
  (
    '0612d049-a097-4856-bd57-dd9f4db0afee',
    'Cerámica Artística y Modelado en Torno',
    'ceramica-artistica-modelado-torno',
    'Preparación de pastas cerámicas, centrado en torno alfarero, confección de piezas utilitarias, texturizado manual, horneado y formulación de esmaltes libres de plomo.',
    'Taller vivencial de modelado cerámico, torno tradicional y quemas comunitarias en horno a gas y leña. Ideal para principiantes y artesanos en desarrollo.',
    'hibrido',
    'publicado',
    15,
    'Sábados • 9:00 AM - 12:00 PM',
    'Sede Central Bogotá • Salón Torno',
    'Mtra. Lucía Forero',
    '2026-I',
    16,
    '/images/taller-ceramica.jpg'
  ),
  (
    'cb664d6b-1031-4365-892a-b7f3ca188e48',
    'Diseño de Cejas y Visagismo Profesional',
    'diseno-de-cejas-y-visagismo',
    'Mapeo morfológico con hilo, visagismo facial según proporciones áureas, tinturado en henna natural, depilación con cera vegetal y protocolo de bioseguridad para emprendimientos estéticos.',
    'Formación técnica de alto impacto laboral. Capacita a mujeres y jóvenes en técnicas modernas de micropigmentación temporal, perfilado estético y esterilización.',
    'presencial',
    'publicado',
    10,
    'Lunes • 3:00 PM - 6:00 PM',
    'Taller Comunitario Suba Rincón',
    'Especialista Andrea Beltrán',
    '2026-I',
    12,
    '/images/taller-decoupage.jpg'
  ),
  (
    'cb664d6b-1031-4365-892a-b7f3ca188e48',
    'Trenzas con Kanekalon y Peinados Afro',
    'trenzas-kanekalon-peinados-afro',
    'Alimentación de cabello sintético sin nudo (knotless), posticería comunitaria, trenzas boxer, espiga y técnicas ancestrales de trenzado afro para fortalecimiento cultural y autonomía económica.',
    'Espacio formativo y de memoria comunitaria donde se enseñan patrones de trenzado africano y caribeño con extensiones de alta calidad.',
    'presencial',
    'publicado',
    12,
    'Sábados Intensivos • 2:00 PM - 6:00 PM',
    'Sede Central Bogotá',
    'Mtra. Yuleisy Palacios',
    '2026-I',
    10,
    '/images/taller-ceramica.jpg'
  ),
  (
    'cb664d6b-1031-4365-892a-b7f3ca188e48',
    'Lifting de Pestañas y Cuidado Facial',
    'lifting-pestanas-cuidado-facial',
    'Curvatura natural de pestañas con keratina, laminado facial no invasivo, limpieza profunda y formulación de rutinas de cuidado estético con aval institucional para rápida salida laboral.',
    'Prácticas guiadas paso a paso con modelos reales y kits aprobados por el INVIMA para brindar servicios estéticos profesionales seguros.',
    'presencial',
    'publicado',
    15,
    'Miércoles • 9:00 AM - 1:00 PM',
    'Sede Central Bogotá',
    'Cosmiatra Diana Morales',
    '2026-I',
    12,
    '/images/taller-decoupage.jpg'
  ),
  (
    '0612d049-a097-4856-bd57-dd9f4db0afee',
    'Marroquinería Artesanal y Trabajo en Cuero',
    'marroquineria-artesanal-cuero',
    'Patronaje de billeteras, monederos y bolsos estructurados. Costura manual a dos agujas, desbaste de cantos, repujado y tinturado vegetal de cuero con altos estándares de calidad artesanal.',
    'Enfoque productivo en acabados de cuero fino y alternativas sintéticas sostenibles para la venta en ferias y comercialización directa.',
    'presencial',
    'publicado',
    12,
    'Viernes • 8:00 AM - 1:00 PM',
    'Taller San Cristóbal Sur',
    'Mtro. Carlos Humberto Ruiz',
    '2026-I',
    16,
    '/images/taller-oleo.jpg'
  ),
  (
    '8f15ccf2-8c60-4b51-bd6c-11df44ac4de6',
    'Costura Creativa y Confección Básica',
    'costura-creativa-confeccion-basica',
    'Operación de máquinas planas y fileteadoras, interpretación de patrones, confección de prendas iniciales y técnicas de ensamble textil para proyectos de emprendimiento familiar.',
    'Taller práctico de sastrería y confección comunitaria. Desarrolla la destreza en corte, costura y patronaje adaptado.',
    'presencial',
    'publicado',
    15,
    'Jueves • 2:00 PM - 6:00 PM',
    'Sede Bosa & Kennedy',
    'Prof. Martha Cecilia Rivas',
    '2026-I',
    14,
    '/images/taller-decoupage.jpg'
  ),
  (
    '0612d049-a097-4856-bd57-dd9f4db0afee',
    'Tejido en Telar Manual y Macramé',
    'tejido-telar-manual-macrame',
    'Técnicas de telar de marco, urdimbre, trama con fibras naturales y nudos decorativos en macramé para la creación de tapices decorativos y accesorios sostenibles.',
    'Técnicas ancestrales de tejido indígena y contemporáneo aplicadas a la decoración de interiores y elaboración de piezas utilitarias.',
    'presencial',
    'publicado',
    12,
    'Martes • 9:00 AM - 12:00 PM',
    'Taller Comunitario Suba Rincón',
    'Mtra. Rosa Elena Quintero',
    '2026-I',
    12,
    '/images/taller-ceramica.jpg'
  ),
  (
    '0612d049-a097-4856-bd57-dd9f4db0afee',
    'Pintura Decorativa y Decoupage en Madera',
    'pintura-decorativa-decoupage-madera',
    'Preparación de superficies en madera y MDF, aplicación de servilletas alemanas con técnica decoupage, pátinas al óleo, craquelados y barnices poliuretánicos de protección.',
    'Aprende a transformar objetos cotidianos en piezas decorativas vintage y rústicas con valor comercial para temporadas festivas y ferias artesanales.',
    'presencial',
    'publicado',
    14,
    'Miércoles • 2:00 PM - 5:00 PM',
    'Sede Central Bogotá (Salón Oficios)',
    'Lic. Patricia Gómez',
    '2026-I',
    12,
    '/images/taller-decoupage.jpg'
  ),
  (
    'cb664d6b-1031-4365-892a-b7f3ca188e48',
    'Barbería Clásica y Corte Masculino',
    'barberia-clasica-corte-masculino',
    'Manejo de máquinas clipper y trimmer, técnica de degradado (fade), afeitado tradicional con navaja y toalla caliente, perfilado de barba y gestión de salón de barbería.',
    'Formación integral para futuros barberos con enfoque en higiene, atención al cliente y técnicas contemporáneas de corte masculino.',
    'presencial',
    'publicado',
    12,
    'Lunes y Miércoles • 6:00 PM - 9:00 PM',
    'Taller Comunitario Kennedy Central',
    'Barbero Máster Julián Cárdenas',
    '2026-I',
    16,
    '/images/taller-oleo.jpg'
  )
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    modality = EXCLUDED.modality,
    status = EXCLUDED.status,
    capacity = EXCLUDED.capacity,
    schedule_text = EXCLUDED.schedule_text,
    location = EXCLUDED.location,
    instructor_name = EXCLUDED.instructor_name,
    cohort = EXCLUDED.cohort,
    total_sessions = EXCLUDED.total_sessions,
    image_url = EXCLUDED.image_url;
