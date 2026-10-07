# Estructura de Carpetas Profesional

La organización del directorio `src/` sigue un enfoque de "Feature-Driven Architecture", garantizando que el código sea modular, escalable y mantenible.

## Arquitectura en `src/`

```text
src/
├── app/                      # App Router (Páginas y layouts de Next.js)
│   ├── (public)/             # Grupo de rutas públicas (Home, Cursos, Donaciones, etc.)
│   ├── (auth)/               # Grupo de rutas de autenticación (Login)
│   ├── (admin)/              # Grupo de rutas protegidas de administración (Dashboard, Cursos, PH)
│   └── api/                  # Route handlers para webhooks o endpoints proxy si se requieren
├── components/               # Componentes React
│   ├── ui/                   # Componentes atómicos/primitivos reusables (Botones, Modales, Inputs, StarfieldBackground)
│   ├── layout/               # Componentes estructurales (Header, Footer, SidebarAdmin, Navbar)
│   ├── shared/               # Componentes compartidos de negocio (CourseCard, StatCard, BannerHero)
│   └── features/             # Componentes agrupados por característica de dominio
│       ├── courses/          # Componentes específicos de cursos
│       ├── donations/        # Componentes específicos de donaciones
│       ├── ph-requests/      # Componentes específicos de propiedad horizontal
│       └── admin/            # Componentes específicos de tableros admin
├── lib/                      # Configuraciones de librerías externas
│   ├── supabase/             # Clientes de Supabase (client.ts, server.ts, middleware.ts)
│   └── utils.ts              # Utilidades globales (cn para tailwind, formateadores)
├── hooks/                    # Custom React Hooks (useAuth, useCourses, useStarfield)
├── services/                 # Capa de consumo directo a Supabase / DB
├── types/                    # Definiciones e interfaces de TypeScript (index.ts, supabase.ts, models.ts)
└── constants/                # Constantes globales (navegación, redes sociales, valores de la fundación)
```

## Beneficios
- **Rutas Limpias:** Usando `(group)` de Next.js evitamos prefijos innecesarios en las URLs mientras seccionamos lógica de UI.
- **Separación de Responsabilidades:** Componentes separados según rol (`ui` para atómicos, `features` para componentes ricos en lógica de negocio).
- **Escalabilidad:** Cada nueva característica tiene su lugar designado dentro `features/`.
