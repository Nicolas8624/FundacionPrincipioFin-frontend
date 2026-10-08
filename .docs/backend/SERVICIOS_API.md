# Manual de Servicios y Consumo de Supabase (API)

Este documento define la estructura y las convenciones para que el frontend (Dev 2) interactúe con el backend de Supabase (construido por Dev 1), asegurando un código limpio, tipado y seguro.

## 1. Arquitectura de Consumo

En Next.js (App Router), el consumo de Supabase se divide en dos entornos:

### A. Server Components y Server Actions (Recomendado)
Para la mayoría de las operaciones (lectura de datos para SEO, inserción de formularios, validaciones seguras).
- Se utiliza `@supabase/ssr` con `createServerClient`.
- Las mutaciones (inserts/updates) desde el frontend público (formularios) se hacen a través de **Server Actions** (`"use server"`).

### B. Client Components
Solo para suscripciones en tiempo real (ej. notificaciones), o cuando se requiere interactividad pura del lado del cliente.
- Se utiliza `createBrowserClient`.

## 2. Estructura de la carpeta `src/services/`

Toda comunicación directa con Supabase debe estar encapsulada en servicios. **No se deben escribir consultas SQL/Supabase directamente en los componentes UI.**

```text
src/
└── services/
    ├── supabase/
    │   ├── server.ts      # Utilidad para inicializar cliente servidor
    │   └── client.ts      # Utilidad para inicializar cliente navegador
    ├── auth.service.ts    # Login, logout, recuperación, sesión
    ├── course.service.ts  # Obtener cursos, lecciones, módulos
    ├── forms.service.ts   # Inserción de inscripciones, donaciones, PH, contacto
    ├── cms.service.ts     # Obtener site_settings, site_sections para UI
    └── portal.service.ts  # Obtener progreso, entregas (submissions)
```

## 3. Tipado Fuerte (Generación de Tipos)

Aprovechando que Dev 1 ha creado un esquema SQL tan completo, se deben generar los tipos de TypeScript automáticamente mediante la CLI de Supabase:

```bash
npx supabase gen types typescript --project-id "tu-project-id" --schema public > src/types/supabase.ts
```

Esto permite consumir los servicios así:
```typescript
import { Database } from '@/types/supabase';

type Course = Database['public']['Tables']['courses']['Row'];
```

## 4. Ejemplo de Flujo de Server Action (Formulario Público)

Las políticas RLS permiten que visitantes anónimos inserten en tablas como `contact_messages` o `donations`. Dev 2 debe usar un Server Action para esto:

```typescript
// src/services/forms.service.ts
"use server"
import { createServerClient } from '@/services/supabase/server';

export async function submitDonation(formData: FormData) {
  const supabase = createServerClient();
  
  const { error } = await supabase.from('donation_requests').insert({
    donor_name: formData.get('name') as string,
    email: formData.get('email') as string,
    donation_type: formData.get('type') as any,
    accepted_data_policy: true,
  });

  if (error) throw new Error(error.message);
  return { success: true };
}
```

## 5. Manejo de Errores y Estados

- Las vistas deben utilizar los estados nativos de Next.js (`useFormStatus`, `useFormState`) para manejar los spinners de carga y los mensajes de error/éxito al consumir los Server Actions.
- Para proteger las rutas privadas (`/admin`, `/portal`), utilizar el middleware de Next.js interceptando la sesión de Supabase.
