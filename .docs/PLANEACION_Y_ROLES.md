# Planeación Técnica y División de Roles

Este documento detalla exhaustivamente el plan de trabajo, la división de tareas entre desarrolladores, el esquema de base de datos en Supabase, el cronograma por fases y las estrategias de control de versiones para el proyecto de la Fundación Principio & Fin.

## 1. Desglose Completo de Tareas, Rutas y Vistas

El desarrollo del proyecto está asignado a dos desarrolladores trabajando en paralelo con las siguientes responsabilidades y asignaciones de rutas:

### Dev 1 (Fullstack DB, Auth & Admin)
Responsable de la infraestructura de backend (Supabase), lógica de autenticación y desarrollo de todo el panel administrativo privado.

**Tareas de Infraestructura:**
- Setup inicial del proyecto en Supabase (Base de datos PostgreSQL, Buckets de Storage, Configuración de RLS).
- Conexión del cliente `@supabase/ssr` y `@supabase/supabase-js`.

**Rutas y Vistas Asignadas:**
- `(auth)/login`: Flujo completo de autenticación y validación de credenciales.
- `(admin)/dashboard`: Panel de administración (Métricas generales, accesos rápidos y resúmenes).
- `(admin)/cursos`: CRUD (Crear, Leer, Actualizar, Eliminar) de cursos, control de cupos y horarios.
- `(admin)/solicitudes-ph`: Tablero para revisión y cambio de estado de solicitudes de conjuntos residenciales (Propiedad Horizontal).
- `(admin)/donaciones`: Módulo de control de aportes, patrocinadores y alianzas.
- `(admin)/mensajes`: Bandeja de lectura y gestión de mensajes de contacto entrantes.

### Dev 2 (Frontend Public UI & Interactividad)
Responsable de la experiencia de usuario (UX), el sistema de diseño visual, maquetación de vistas públicas y componentes.

**Tareas de Infraestructura Visual:**
- Setup y configuración inicial de Next.js, Tailwind CSS y componentes primitivos (Shadcn/UI, Lucide React).
- Implementación de animaciones globales como el `<StarfieldBackground/>` (fondo interactivo espacial).
- Creación de Layouts globales (`Navbar`, `Footer`) y tipografía/paleta de colores (Negro, Blanco, Dorado).

**Rutas y Vistas Asignadas:**
- `(public)/`: Home (Hero, métricas, atajos a programas).
- `(public)/quienes-somos`: Historia, misión, visión y equipo.
- `(public)/programas`: Catálogo interactivo de cursos (3 ejes formativos).
- `(public)/propiedad-horizontal`: Beneficios para conjuntos residenciales y solicitud.
- `(public)/donaciones`: Módulo de información para aportes en dinero, especie o equipos.
- `(public)/contacto`: Formulario y canales directos (WhatsApp, mapas, redes sociales).
- `(public)/inscripcion`: Formulario general de registro a cursos.
- **Integración de Formularios**: Conexión de los formularios públicos (contacto, inscripción, donaciones, solicitudes) con el backend en Supabase mediante el cliente expuesto por el Dev 1.

---

## 2. Esquema de Datos y Políticas RLS (Supabase)

El backend BaaS se alojará en Supabase. A continuación se mapean las tablas principales requeridas y las reglas de seguridad a nivel de fila (Row Level Security - RLS).

### Mapa de Tablas (PostgreSQL)

Basado en los diseños de las interfaces (carpeta `designs/`), este es el esquema detallado que requerimos:

1. **`profiles` (Perfiles y Administradores)**
   - `id` (uuid, PK, referencia a auth.users)
   - `role` (enum: 'admin', 'superadmin', 'user')
   - `full_name` (text)
   - `created_at` (timestamp)

2. **`courses` (Oferta Formativa - *Ref: AdminCursos.png*)**
   - `id` (uuid, PK)
   - `title` (text, ej: "Pintura en cerámica")
   - `short_description` (text)
   - `category` (enum: 'Arte y oficios', 'Belleza y estética', etc.)
   - `schedule` (text, ej: "Sábados 9:00 a.m. - 12:00 m.")
   - `capacity` (int, ej: 15)
   - `enrolled_count` (int, default: 0)
   - `status` (enum: 'publicado', 'borrador')
   - `image_url` (text, nullable)
   - `created_at` (timestamp)

3. **`enrollments` (Inscripciones - *Ref: Inscripcion.png*)**
   - `id` (uuid, PK)
   - `course_id` (uuid, FK a courses)
   - `full_name` (text)
   - `document_type` (text, ej: "Cédula de Ciudadanía")
   - `document_number` (text)
   - `birth_date` (date)
   - `phone` (text)
   - `email` (text)
   - `locality` (text, ej: "Bosa")
   - `guardian_name` (text, nullable, para menores)
   - `accepted_data_policy` (boolean)
   - `created_at` (timestamp)

4. **`ph_requests` (Alianza Residencial - *Ref: Propiedad.png*)**
   - `id` (uuid, PK)
   - `admin_name` (text)
   - `role` (text, ej: "Administrador")
   - `residential_name` (text)
   - `address_locality` (text)
   - `phone` (text)
   - `email` (text)
   - `residents_approx` (text)
   - `message` (text)
   - `accepted_data_policy` (boolean)
   - `status` (enum: 'pendiente', 'en revision', 'aprobada')
   - `created_at` (timestamp)

5. **`contact_messages` (Contacto - *Ref: Cotacto.png*)**
   - `id` (uuid, PK)
   - `full_name` (text)
   - `email` (text)
   - `phone` (text)
   - `subject` (text, ej: "Inscripción a cursos")
   - `message` (text)
   - `accepted_data_policy` (boolean)
   - `status` (enum: 'nuevo', 'leido', 'respondido')
   - `created_at` (timestamp)

6. **`donations` (Donaciones y Alianzas - *Ref: Donaciones.png*)**
   - `id` (uuid, PK)
   - `name_or_company` (text)
   - `donation_type` (text, ej: "Donación económica", "Insumos educativos", "Equipos y materiales", "Alianza empresarial")
   - `phone` (text)
   - `email` (text)
   - `message` (text)
   - `accepted_data_policy` (boolean)
   - `status` (enum: 'pendiente', 'gestionado')
   - `created_at` (timestamp)

### Políticas de Seguridad RLS
- **Cursos (`courses`)**: 
  - Lectura: Pública (cualquier visitante puede ver los cursos).
  - Escritura/Modificación: Solo administradores autenticados.
- **Formularios de ingreso (`enrollments`, `ph_requests`, `contact_messages`, `donations`)**:
  - Inserción (Insert): Pública (cualquier visitante puede enviar un formulario).
  - Lectura/Modificación: Solo administradores autenticados.
- **Perfiles (`profiles`)**:
  - Lectura/Modificación: Privada (solo el propio usuario autenticado o super-admin).

---

## 3. Cronograma por Fases de Desarrollo (Sprints)

El ciclo de desarrollo se divide en 4 fases principales para asegurar entregas continuas y paralelas.

### Fase 1: Fundaciones (Setup, DB, Diseño y Layout)
- **Dev 1**: Configura el proyecto Supabase, crea las tablas SQL y define las políticas RLS iniciales.
- **Dev 2**: Implementa tokens de diseño, layout base (Navbar, Footer, StarfieldBackground) y componentes UI reutilizables (Botones, Tarjetas, Inputs).

### Fase 2: Desarrollo Paralelo (Vistas Públicas y Admin Core)
- **Dev 1**: Desarrolla el módulo de autenticación (Login) y la vista inicial del Dashboard Admin con protección de rutas. Comienza el CRUD de Cursos.
- **Dev 2**: Maqueta y desarrolla estáticamente las vistas públicas clave (`Home`, `Quiénes Somos`, `Programas`, `Contacto`).

### Fase 3: Integración y Lógica de Negocio
- **Dev 1**: Finaliza los módulos del panel administrativo (`/admin/solicitudes-ph`, `/admin/donaciones`, `/admin/mensajes`).
- **Dev 2**: Conecta los formularios públicos (`Inscripción`, `Contacto`, `Donaciones`, `Propiedad Horizontal`) insertando datos en las tablas de Supabase utilizando las funciones cliente de Dev 1.

### Fase 4: Pulido, Pruebas y Despliegue
- **Conjunto**: Validación de permisos (RLS comprobado), manejo de estados de carga y error, validación de formularios.
- **Conjunto**: Auditoría de diseño responsivo, rendimiento del fondo animado y accesibilidad web.
- **Conjunto**: Despliegue a producción (ej. Vercel) y entrega de credenciales.

---

## 4. Estrategia de Git Flow y Commits Semánticos

Para mantener un repositorio estable y un historial trazable, se adopta el siguiente flujo:

### Ramas Principales
- `main`: Rama de producción. Contiene únicamente código estable, probado y listo para despliegue.
- `develop`: Rama de integración principal donde se centraliza el trabajo activo.

### Ramas de Características (Features)
Cualquier tarea de las fases de desarrollo inicia desde `develop` hacia una nueva rama descriptiva y, una vez terminada, se integra de vuelta.
- Nomenclatura: `feature/<nombre-tarea>`
- Ejemplos: `feature/ui-base`, `feature/supabase-setup`, `feature/admin-cursos`, `feature/home-view`.

### Convención de Commits Semánticos
Cada confirmación de código seguirá el siguiente formato estándar para indicar la naturaleza del cambio:
- `feat(ui/db/auth): ...` → Añade una nueva funcionalidad (Ej: `feat(db): crear tabla courses`).
- `fix(ui/db/auth): ...` → Corrige un error (Ej: `fix(auth): reparar redireccion en login`).
- `docs(plan/readme): ...` → Modifica archivos de documentación (Ej: `docs(plan): actualizar cronograma`).
- `chore(setup/deps): ...` → Cambios menores, dependencias o configuración que no modifican código de producción (Ej: `chore(setup): configurar tailwind config`).
- `refactor(ui): ...` → Cambios en la estructura del código sin alterar su comportamiento visual o funcional.
