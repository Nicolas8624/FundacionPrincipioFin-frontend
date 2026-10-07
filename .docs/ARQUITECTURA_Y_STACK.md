# Arquitectura y Stack Tecnológico

Este documento define la arquitectura y las tecnologías base utilizadas en el proyecto de la **Fundación Principio & Fin**.

## Stack Tecnológico

1. **Frontend**: Next.js 14+ (App Router). Framework base de React para construir interfaces escalables con SSR/SSG.
2. **Lenguaje**: TypeScript. Para tipado estático seguro y mejor escalabilidad del código.
3. **Estilos**: Tailwind CSS. Framework utility-first para desarrollo ágil de UI.
4. **Backend / BaaS**: Supabase. Proporciona PostgreSQL, Supabase Auth, Storage y Row Level Security (RLS).
5. **Iconografía**: Lucide React. Biblioteca de iconos escalables, consistentes y ligeros.
6. **Componentes UI**: Inspirado en Shadcn/Radix UI, proveyendo componentes accesibles y con alta personalización.

## Flujo de Trabajo (Git Flow)

Adoptamos una estrategia de ramificación basada en Git Flow:
- `main`: Rama de producción. Contiene los lanzamientos estables.
- `develop`: Rama principal de integración.
- `feature/*`: Ramas temporales creadas a partir de `develop` para desarrollar nuevas funcionalidades. Al completarse, se fusionan de vuelta a `develop`.

## Convención de Commits Semánticos

Para mantener un historial de cambios legible, utilizamos commits semánticos:
- `feat(...)`: Introduce una nueva característica (ej. `feat(ui): añadir banner principal`).
- `fix(...)`: Soluciona un error (ej. `fix(auth): corregir fallo de login`).
- `docs(...)`: Actualiza la documentación.
- `chore(...)`: Cambios menores, de configuración o de herramientas.
- `refactor(...)`: Reestructuración del código sin añadir funcionalidades.
