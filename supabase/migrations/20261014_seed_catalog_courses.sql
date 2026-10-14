-- =====================================================================
-- SEED: CURSOS OFICIALES PARA EL CATÁLOGO Y CONVOCATORIAS ABIERTAS
-- =====================================================================
-- Fundación Principio & Fin
-- Ejecutar en Supabase > SQL Editor para poblar los talleres del ciclo 2026.
-- =====================================================================

INSERT INTO public.courses (
  category_id,
  title,
  slug,
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
    'cb664d6b-1031-4365-892a-b7f3ca188e48',
    'Diseño de Cejas y Visagismo Profesional',
    'diseno-de-cejas-y-visagismo',
    'Mapeo morfológico con hilo, visagismo facial según proporciones áureas, tinturado en henna natural, depilación con cera vegetal y protocolo de bioseguridad para emprendimientos estéticos.',
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
    '0612d049-a097-4856-bd57-dd9f4db0afee',
    'Cerámica Artística y Modelado en Torno',
    'ceramica-artistica-modelado-torno',
    'Preparación de pastas cerámicas, centrado en torno alfarero, confección de piezas utilitarias, texturizado manual, horneado y formulación de esmaltes libres de plomo.',
    'hibrido',
    'publicado',
    15,
    'Sábados • 9:00 AM - 12:00 PM',
    'Sede Central Bogotá • Salón Torno',
    'Maestra Lucía Forero',
    '2026-I',
    16,
    '/images/taller-ceramica.jpg'
  ),
  (
    '8f15ccf2-8c60-4b51-bd6c-11df44ac4de6',
    'Costura Creativa y Confección Básica',
    'costura-creativa-confeccion-basica',
    'Operación de máquinas planas y fileteadoras, interpretación de patrones, confección de prendas iniciales y técnicas de ensamble textil para proyectos de emprendimiento familiar.',
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
    'presencial',
    'publicado',
    12,
    'Martes • 9:00 AM - 12:00 PM',
    'Taller Comunitario Suba Rincón',
    'Mtra. Rosa Elena Quintero',
    '2026-I',
    12,
    '/images/taller-ceramica.jpg'
  )
ON CONFLICT (slug) DO NOTHING;
