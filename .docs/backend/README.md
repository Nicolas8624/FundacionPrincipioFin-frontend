# Arquitectura y Guía de Base de Datos — Fundación Principio & Fin

Esta carpeta contiene la arquitectura oficial y consolidada de la base de datos PostgreSQL en Supabase, organizada en una secuencia numerada de 3 pasos (1 -> 2 -> 3) para que cualquier desarrollador pueda desplegar, migrar y poblar el sistema de manera limpia y sin errores.

---

## 📁 Estructura de Scripts Numerados

```
.docs/backend/
├── 01_esquema_completo.sql      # 1. Esquema Maestro (14 Tablas, Enums, Funciones, RLS, Storage Buckets)
├── 02_datos_semilla_cursos.sql  # 2. Catálogo Oficial (3 Categorías + 10 Cursos Oficiales 2026 con imágenes)
├── 03_datos_prueba_juan.sql     # 3. Datos de Prueba para Usuario Juan (id: 47bbf374-a969-4dce-baa4-e28444c544f2)
├── README.md                    # Esta guía de despliegue y arquitectura
├── SEED_ESTRATEGIA.md           # Estrategia de inicialización de contenidos
└── SERVICIOS_API.md             # Documentación de servicios y endpoints
```

---

## 🚀 Guía de Despliegue en Supabase

### Opción A: Base de datos desde cero (Instalación Limpia)
Ejecuta los siguientes scripts en orden secuencial en **Supabase Dashboard > SQL Editor**:

1. **Paso 1: `01_esquema_completo.sql`**
   - Crea todos los tipos personalizados (`user_role`, `course_modality`, `submission_status`, etc.).
   - Crea las 14 tablas relacionales (`profiles`, `courses`, `course_enrollments`, `course_modules`, `assignments`, `submissions`, `submission_files`, `ph_requests`, `donation_requests`, `contact_messages`, `gallery_items`, etc.).
   - Aplica Row Level Security (RLS) en todas las tablas.
   - Crea los buckets de Storage (`gallery`, `submissions`, `course-materials`, `profile-avatars`) con sus políticas.

2. **Paso 2: `02_datos_semilla_cursos.sql`**
   - Puebla las 3 categorías formativas y los 10 talleres oficiales para el catálogo público y el portal.
   - Incluye imágenes oficiales, cohortes (`2026-I`), modalidades, horarios, sedes y docentes formadores.

3. **Paso 3: `03_datos_prueba_juan.sql`**
   - Puebla la cuenta de prueba del usuario **Juan** (`47bbf374-a969-4dce-baa4-e28444c544f2`).
   - Crea sus 2 Solicitudes PH (en revisión y aprobada).
   - Crea su donación de $500.000 COP concretada.
   - Crea sus 2 PQRS (1 respondida con respuesta oficial de soporte, 1 nueva).
   - Matricula a Juan en 2 cursos con módulos y actividades en diversos estados:
     - **Cerámica**: Actividad 1.1 (Calificada 4.8), Actividad 2.1 (Calificada 4.5), Actividad 3.1 (Entregada en revisión), Actividad 3.3 (Borrador guardado).
     - **Pintura al Óleo**: Actividad 1.1 (Pendiente de entrega desde cero).

---

### Opción B: Base de datos ya creada (Solo actualizar pruebas de Juan)
Si ya ejecutaste el esquema maestro y solo deseas actualizar los datos de prueba de Juan:
- Ejecuta en **SQL Editor** únicamente el archivo:
  `03_datos_prueba_juan.sql`
  *(también sincronizado en `supabase/migrations/20261014_seed_juan_portal_completo.sql`)*.

---

## 🔒 Matriz de Seguridad y Políticas RLS

| Tabla | Acceso Público (Anon) | Acceso Usuario (Autenticado) | Acceso Administrador |
| :--- | :--- | :--- | :--- |
| `profiles` | - | SELECT / UPDATE (propio) | ALL (Gestión total) |
| `courses` | SELECT (publicados) | SELECT (publicados) | ALL (Gestión total) |
| `course_categories` | SELECT | SELECT | ALL (Gestión total) |
| `course_enrollments` | INSERT (formulario web) | SELECT (propias por ID o email) | ALL (Gestión total) |
| `course_modules` | SELECT | SELECT | ALL (Gestión total) |
| `course_materials` | SELECT (publicados) | SELECT (publicados) | ALL (Gestión total) |
| `assignments` | SELECT (publicadas) | SELECT (publicadas) | ALL (Gestión total) |
| `submissions` | - | SELECT / INSERT / UPDATE (propias) | ALL (Gestión y calificación) |
| `submission_files` | - | SELECT / INSERT (propias) | ALL (Gestión total) |
| `ph_requests` | INSERT (formulario web) | SELECT (propias por ID o email) | ALL (Gestión total) |
| `donation_requests` | INSERT (formulario web) | SELECT (propias por ID o email) | ALL (Gestión total) |
| `contact_messages` | INSERT (formulario web) | SELECT (propias por ID o email) | ALL (Gestión total) |
| `gallery_items` | SELECT | SELECT | ALL (Gestión total) |
