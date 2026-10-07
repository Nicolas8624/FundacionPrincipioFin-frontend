# Planeación y División de Roles

El desarrollo del proyecto está asignado a dos desarrolladores trabajando en paralelo. Esta es la distribución de responsabilidades:

## Dev 1 (Fullstack DB, Auth & Admin)
Encargado de la infraestructura backend, la autenticación y el panel administrativo.
- **Configuración Supabase:** Setup del proyecto, esquemas PostgreSQL, Storage y configuración de políticas RLS.
- **Autenticación:** Implementación de Supabase Auth (diferenciación de roles Admin y Usuario).
- **Vistas y Flujos Protegidos:**
  - `/login`: Flujo de inicio de sesión.
  - `/admin/dashboard`: Panel de resumen administrativo.
  - `/admin/cursos`: Gestión y creación de la oferta formativa.
  - `/admin/solicitudes-ph`: Gestión de las solicitudes de unidades residenciales (Propiedad Horizontal).

## Dev 2 (Frontend Public UI & Interactividad)
Encargado de la experiencia de usuario y la interfaz gráfica pública.
- **Configuración Inicial Frontend:** Setup de Next.js, Tailwind CSS y estructura de carpetas `src/`.
- **Sistema de Diseño y Animaciones:** Implementación del fondo espacial animado `<StarfieldBackground/>`, variables, tokens de colores y componentes base de UI.
- **Vistas Públicas:** Maquetación e integración de `Home`, `Quiénes Somos`, `Programas`, `Donaciones`, `Contacto` e `Inscripción`.
- **Formularios Públicos:** Integración de los formularios orientados a beneficiarios y aliados con el backend (Supabase) configurado por Dev 1.
